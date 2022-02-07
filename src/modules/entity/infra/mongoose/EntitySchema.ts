import { Schema, Model, model, Types } from "mongoose";

export interface EntityDoc {
  _id: Types.ObjectId;
  firstName: string;
  lastName?: string;
  entityType: string;
  displayName?: string;
  personalNumber?: string; // use value object
  identityCard?: string;
  employeeId?: string;
  organization?: string;
  rank?: string; //use vale object / enum
  akaUnit?: string;
  clearance?: string; // value object
  mail?: string; //value object
  sex?: string;
  serviceType?: string; //value object
  dischargeDay?: Date;
  birthDate?: Date;
  jobTitle?: string;
  address?: string; // value?
  phone?: string[]; //value object
  mobilePhone?: string[]; //value object
  goalUserId?: string;
  primaryDigitalIdentityId?: string;
  pictures?: {
    profile?: {
      meta: {
        path: string;
        format: string;
        updatedAt?: Date;
      };
    };
  };
  version: number;
}

const schema = new Schema<EntityDoc, Model<EntityDoc>, EntityDoc>(
  {
    firstName: String,
    lastName: String,
    entityType: String,
    displayName: String,
    personalNumber: { type: String, unique: true, sparse: true }, // use value object
    identityCard: { type: String, unique: true, sparse: true  },
    employeeId: { type: String, sparse: true  },
    organization: { type: String, sparse: true },
    rank: String, //use vale object / enum
    akaUnit: String,
    clearance: String, // value object
    mail: String, //value object
    sex: String,
    serviceType: String, //value object
    dischargeDay: Date,
    birthDate: Date,
    jobTitle: String,
    address: String, // value
    phone: [String], //value object
    mobilePhone: [String], //value object
    goalUserId: { type: String, unique: true, sparse: true  },
    primaryDigitalIdentityId: String,
    pictures: {
      profile: {
        meta: {
          takenAt: Date,
          path: String,
          format: String,
          updatedAt: Date,
        },
      },
    },
    version: Number,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

schema.index({ employeeId: 1, organization: 1} , {unique: true, sparse: true} ); 
// schema.index({ personalNumber: 1 })
// schema.index({ identityCard: 1 })
// schema.index({ goalUserId: 1 })
// schema.index({ entityType: 1 })

export default schema;
