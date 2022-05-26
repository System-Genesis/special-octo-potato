// import { DomainEvent } from "../../../../core/domain/event/DomainEvent";
// import { RoleId } from "../RoleId";
// import { DigitalIdentityId } from "../../../digitalIdentity/domain/DigitalIdentityId";
// import { GroupId } from "../../../group/domain/GroupId";

// type RoleEventPayload = {
//   roleId: RoleId;
//   disconnectedDigitalIdentityId: DigitalIdentityId;
//   jobTitle?: string;
//   directGroup: GroupId;
//   // hierarchyIds: GroupId[];
//   // hierarchy: Hierarchy;
// }

// export class RoleDisconnectedEvent extends DomainEvent<RoleEventPayload> {
//   toPlainObject(): object {
//     const {
//       roleId, disconnectedDigitalIdentityId, jobTitle, directGroup
//       ,
//     } = this.payload;
//     return {
//       roleId: roleId.toString(),
//       directGroup: directGroup.toString(),
//       disconnectedDigitalIdentityId: disconnectedDigitalIdentityId.toString(),
//       // hierarchy: hierarchy.value(),
//       // hierarchyIds: hierarchyIds.map(id => id.toString()),
//       // ...!!jobTitle && { jobTitle },
//     };
//   }

//   get roleId() {
//     return this.payload.roleId;
//   }
//   get disconnectedDigitalIdentityId() {
//     return this.payload.disconnectedDigitalIdentityId;
//   }
//   get directGroup() {
//     return this.payload.directGroup;
//   }
//   get jobTitle() {
//     return this.payload.jobTitle;
//   }
//   // get hierarchyIds() {
//   //   return this.payload.hierarchyIds;
//   // }
//   // get hierarchy() {
//   //   return this.payload.hierarchy;
//   // }
// }