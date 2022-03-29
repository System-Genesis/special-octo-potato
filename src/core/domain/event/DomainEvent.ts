// import { IDomainEvent } from "./IDomainEvent";
// import { UniqueEntityId } from "../UniqueEntityId";

// export abstract class DomainEvent<T> implements IDomainEvent {
//   readonly occuredOn: Date;
//   readonly aggregateId: UniqueEntityId;
//   readonly eventType: string;
//   protected payload: T;

//   constructor(aggregateId: UniqueEntityId, payload: T & { occuredOn?: Date }) {
//     this.eventType = this.constructor.name;
//     const { occuredOn, ...rest } = payload;
//     this.occuredOn = occuredOn || new Date();
//     this.aggregateId = aggregateId;
//     this.payload = rest as T;
//   }

//   static getEventName() {
//     return this.name;
//   }

//   abstract toPlainObject(): object;
// }
