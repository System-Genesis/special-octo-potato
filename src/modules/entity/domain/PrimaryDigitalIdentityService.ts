import { priorityInArray } from './../../../utils/arrayUtils';
import { Entity } from "./Entity";
import { DigitalIdentity } from "../../digitalIdentity/domain/DigitalIdentity";
import { Role } from "../../Role/domain/Role";
import { Source } from "../../digitalIdentity/domain/Source";
import { Mail } from "../../digitalIdentity/domain/Mail";
import { EntityId } from "./EntityId";
import { DigitalIdentityId } from "../../digitalIdentity/domain/DigitalIdentityId";
import config from "config";
import { IConnectedDI } from "./ConnectedDI";
import { wrapResult } from "../../../utils/resultUtils";
// TODO: inject config in another way
const STRONG_SOURCES: string[] = config.get('valueObjects.source.strongSources');
const WEAK_SOURCES: string[] = config.get('valueObjects.source.weakSources');
const PRIMARY_MAP: object = config.get('valueObjects.source.primaryMap');
const SOURCES_PRIORITY: string[] = config.get('valueObjects.source.prioritySources');

export class PrimaryDigitalIdentityService { // TODO: should be "static" class
  static _primarySourceMap: Map<string, Source> = new Map(Object.entries(PRIMARY_MAP)
    .map(([key, source]) => [key, wrapResult(Source.create(source as string))]));


  static _sourcesPriority: string[] = []

  static haveStrongSource(digitalIdentity: IConnectedDI) {
    return STRONG_SOURCES.includes(digitalIdentity.source.value);
  }

  static havePrimarySource(akaUnit: string | undefined, digitalIdentity: IConnectedDI) {
    return !!akaUnit ?
      digitalIdentity.source.value === PrimaryDigitalIdentityService._primarySourceMap.get(akaUnit)?.value :
      false;
  }

  static isWeakSource(digitalIdentity: IConnectedDI) {
    return WEAK_SOURCES.includes(digitalIdentity.source.value);
  }

  static preferredSource(digitalIdentities: IConnectedDI[]) {
    const digitalIdentitiesSources = digitalIdentities.map(di => di.source.value);
    const prefferedSourceIndex = priorityInArray(digitalIdentitiesSources, SOURCES_PRIORITY);
    return digitalIdentitiesSources[prefferedSourceIndex];
  }

  // public setEntityPrimaryDigitalIdentity(
  //   entity: Entity,
  //   connectedDigitalIdentity: DigitalIdentity,
  // ) {
  //   if (
  //     !connectedDigitalIdentity.connectedEntityId?.equals(entity.entityId) ||
  //     !connectedRole.digitalIdentityUniqueId?.equals(connectedDigitalIdentity.uniqueId)
  //   ) {
  //     /**
  //      * DI not Connected to Entity or Role not Connected to DI 
  //      * should return error so calling service will log it
  //      */
  //     return;
  //   }
  //   if (PrimaryDigitalIdentityService.havePrimarySource(entity, connectedDigitalIdentity)) {
  //     entity.setHierarchy(Hierarchy.create(connectedRole.hierarchy));
  //     // set other fields
  //   }
  // }


}