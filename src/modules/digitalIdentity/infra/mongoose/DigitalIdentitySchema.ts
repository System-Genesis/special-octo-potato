import { DigitalIdentityTypes } from './../../domain/DigitalIdentity';
import { Schema, Model, Types, model } from 'mongoose';

export interface DigitalIdentityDoc {
  uniqueId: string;
  type: string;
  source: string; // enum?
  mail?: string; 
  isRoleAttachable?: boolean;
  entityId?: Types.ObjectId;
  version: number;
}

const schema = new Schema<DigitalIdentityDoc, Model<DigitalIdentityDoc>, DigitalIdentityDoc> ({
  uniqueId: { type: String, unique: true, required: true },
  entityId: { type: Schema.Types.ObjectId, ref: () => 'Entity' }, // TODO: model names provider?
  type: { 
    type: String,
    enum: [ DigitalIdentityTypes.DomainUser, DigitalIdentityTypes.VirtualUser ],
  },
  source: String,
  mail: String,
  isRoleAttachable: Boolean,
  version: Number,
},{
  versionKey: false,
  timestamps: true,
});

// schema.index({ source: 1 })
// schema.index({ mail: 1 })
// schema.index({ isRoleAttachable: 1 })

export default schema;
