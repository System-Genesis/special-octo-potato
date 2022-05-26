import { DigitalIdentityId } from "../../../digitalIdentity/domain/DigitalIdentityId";
import { GroupId } from "../../../group/domain/GroupId";
import { Group } from "../../domain/Group";
import { GroupDoc } from "./GroupSchema";
import { Types } from "mongoose";
import { Source } from "../../../digitalIdentity/domain/Source";
import { wrapResult } from "../../../../utils/resultUtils";

export class GroupMapper {

  static toPersistance(group: Group): GroupDoc {
    return {
      _id: Types.ObjectId(group.groupId.toString()),
      name: group.name,
      source: group.source.value,
      // ancestors: group.ancestors.map(ancestorId => Types.ObjectId(ancestorId.toString())),
      directGroup: !!group.parentId ? Types.ObjectId(group.parentId.toString()) : undefined,
      // hierarchy: group.hierarchy,
      akaUnit: group.akaUnit,
      diPrefix: group.diPrefix,
      status: group.status,
      version: group.version,
      isLeaf: group.isLeaf
    }
  }

  static toDomain(
    raw: GroupDoc & { 
      ancestors: Types.ObjectId[],
      childrenNames: string[],
    } 
  ): Group {
    const groupId = GroupId.create(raw._id.toHexString());
    const sourceRes = Source.create(raw.source);
    const sourceExtracted = wrapResult(sourceRes)
    return Group._create(
      groupId,
      {
        name: raw.name,
        source: sourceExtracted!,
        ancestors: raw.ancestors.map(ancestorId => GroupId.create(ancestorId.toHexString())),
        childrenNames: new Set(raw.childrenNames),
        akaUnit: raw.akaUnit,
        status: raw.status,
        diPrefix: raw.diPrefix,
        isLeaf: raw.isLeaf,
        // hierarchy: Hierarchy.create(raw.hierarchy),
      },
      { isNew: false, savedVersion: raw.version },
    );
  }
}
