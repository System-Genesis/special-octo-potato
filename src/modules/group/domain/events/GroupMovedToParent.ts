// import { DomainEvent } from "../../../../core/domain/event/DomainEvent";
// import { GroupId } from "../GroupId";
// import { Source } from "../../../digitalIdentity/domain/Source";

// type GroupEventPayload = {
//   previousParentId?: GroupId;
//   groupId: GroupId;
//   name: string;
//   source: Source; // TODO: value object. 
//   akaUnit?: string;
//   // hierarchy: Hierarchy;
//   ancestors: GroupId[];
//   status?: string;
// }

// export class GroupMovedToParentEvent extends DomainEvent<GroupEventPayload> {
//   toPlainObject(): object {
//     const {
//       groupId, name, source, akaUnit, ancestors, status, previousParentId
//     } = this.payload;

//     return {
//       name,
//       // hierarchy,
//       ancestors,
//       source: source.value,
//       groupId: groupId.toString(),
//       ...!!akaUnit && { akaUnit },
//       ...!!status && { status },
//       ...!!previousParentId && { previousParentId: previousParentId.toString() },
//     };
//   }

//   get groupId() {
//     return this.payload.groupId;
//   }
//   get name() {
//     return this.payload.name;
//   }
//   get source() {
//     return this.payload.source;
//   }
//   get akaUnit() {
//     return this.payload.akaUnit;
//   }
//   // get hierarchy() {
//   //   return this.payload.hierarchy;
//   // }
//   get ancestors() {
//     return this.payload.ancestors;
//   }
//   get status() {
//     return this.payload.status;
//   }
//   get previousParentId() {
//     return this.payload.previousParentId;
//   }

// }