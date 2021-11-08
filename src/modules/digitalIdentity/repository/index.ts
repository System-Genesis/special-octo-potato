import { DigitalIdentityRepository } from "../infra/mongoose/DigitalIdentityRepository";
import connection from "../../../shared/infra/mongoose/connection"
import { eventOutbox } from "../../../shared/infra/mongoose/eventOutbox";
import config from "config";

export const digitalIdentityRepository = new DigitalIdentityRepository(
  connection, 
  eventOutbox,
  { modelName: config.get('db.mongo.modelNames.digitalIdentity') }
) ;
 