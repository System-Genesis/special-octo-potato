import { Schema, Model, SchemaOptions, model, ClientSession, Connection } from "mongoose"
import { IDomainEvent } from "../../../../core/domain/event/IDomainEvent";

export type OutboxMessage = {
  type: string;
  created: Date;
  occuredOn: Date;
  aggregateId: string;
  payload: any;
  published: boolean;
}

const options: SchemaOptions = {
  timestamps: {
    createdAt: 'created',
    updatedAt: false,
  }
};

export const outboxMessageSchema = new Schema<OutboxMessage, Model<OutboxMessage>, OutboxMessage>({
  type: {
    type: String,
    required: true,
  },
  aggregateId: String,
  published: Boolean,
  occuredOn: Date,
  payload: {},
}, options);


export class EventOutbox {
  private _model: Model<OutboxMessage>;

  constructor(db: Connection, config: { modelName: string }) {
    const { modelName } = config;
    if(db.modelNames().includes(modelName)) {
      this._model = db.model(modelName); 
    } else {
      this._model = db.model(modelName, outboxMessageSchema);
    }
  }

  async put<T extends IDomainEvent>(events: T | T[], session: ClientSession) {
    if(Array.isArray(events)) {
      await this._model.insertMany(events.map(this.eventToMessage), { session });
    } else {
      await this._model.create([this.eventToMessage(events)], { session });
    }
  }

  private eventToMessage(event: IDomainEvent) {
    return {
      type: event.eventType,
      occuredOn: event.occuredOn,
      aggregateId: event.aggregateId.toString(),
      payload: event.toPlainObject(),
    };
  }
}