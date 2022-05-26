import { Schema, Model, model, Types } from "mongoose";

export interface RoleDoc {
  roleId: string;
  source: string;
  jobTitle?: string;
  directGroup: Types.ObjectId;
  digitalIdentityUniqueId?: string;
  clearance?: string;
  version: number;
  // hierarchyIds: string[];
  // hierarchy: string;
}

const schema = new Schema<RoleDoc, Model<RoleDoc>, RoleDoc> ({
  roleId: { type: String, unique: true, required: true },
  digitalIdentityUniqueId: { 
    type: String, 
    unique: true,
    sparse: true,
    ref: () => 'DigitalIdentity', // TODO: model names provider?
  }, 
  source: String,
  directGroup: Schema.Types.ObjectId,
  jobTitle: String,
  clearance: String,
  version: Number,
},{
  versionKey: false,
  timestamps: true,
});

// schema.index({ source: 1 })
// schema.index({ directGroup: 1 })

export default schema;
