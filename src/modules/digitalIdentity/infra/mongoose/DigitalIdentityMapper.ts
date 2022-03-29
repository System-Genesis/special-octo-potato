import { DigitalIdentity } from "../../domain/DigitalIdentity";
import { DigitalIdentityId } from "../../domain/DigitalIdentityId";
import { DigitalIdentityDoc } from "./DigitalIdentitySchema";
import { EntityId } from "../../../entity/domain/EntityId";
import { Types } from "mongoose";
import { Mail } from "../../domain/Mail";
import { Source } from "../../domain/Source";
import { wrapResult } from "../../../../utils/resultUtils";

export class DigitalIdentityMapper {
  static toPersistance(digitalIdentity: DigitalIdentity): DigitalIdentityDoc {
    const persistanced: DigitalIdentityDoc = {
      uniqueId: digitalIdentity.uniqueId.toString(),
      type: digitalIdentity.type,
      source: digitalIdentity.source.value,
      mail: digitalIdentity.mail?.value,
      isRoleAttachable: digitalIdentity.canConnectRole,
      version: digitalIdentity.version,
      upn: digitalIdentity.upn,
      createdAt: digitalIdentity.createdAt,
    };
    if (digitalIdentity.connectedEntityId) {
      persistanced.entityId = Types.ObjectId(
        digitalIdentity.connectedEntityId.toString()
      );
    }
    return persistanced;
  }

  static toDomain(raw: DigitalIdentityDoc): DigitalIdentity {
    const uid = DigitalIdentityId.create(raw.uniqueId)._unsafeUnwrap();
    const entityId = raw.entityId;
    const sourceRes = Source.create(raw.source);
    const sourceExtracted = wrapResult(sourceRes);
    return DigitalIdentity.create(
      uid,
      {
        mail: !!raw.mail ? Mail.create(raw.mail)._unsafeUnwrap() : undefined,
        source: sourceExtracted!,
        type: raw.type,
        canConnectRole: raw.isRoleAttachable,
        entityId: !!entityId
          ? EntityId.create(entityId.toHexString())
          : undefined,
        upn: raw.upn,
        createdAt: raw.createdAt,
      },
      { isNew: false, savedVersion: raw.version }
    )._unsafeUnwrap();
  }
}
