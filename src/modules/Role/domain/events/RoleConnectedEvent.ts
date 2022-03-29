// import { DomainEvent } from "../../../../core/domain/event/DomainEvent";
// import { RoleId } from "../RoleId";
// import { DigitalIdentityId } from "../../../digitalIdentity/domain/DigitalIdentityId";
// import { GroupId } from "../../../group/domain/GroupId";

// type RoleEventPayload = {
//   roleId: RoleId;
//   connectedDigitalIdentityId: DigitalIdentityId;
//   jobTitle?: string;
//   directGroup: GroupId;
//   // hierarchyIds: GroupId[];
//   // hierarchy: Hierarchy;
// }

// export class RoleConnectedEvent extends DomainEvent<RoleEventPayload> {
//   toPlainObject(): object {
//     const {
//       roleId, connectedDigitalIdentityId, jobTitle, directGroup
//     } = this.payload
//     return {
//       roleId: roleId.toString(),
//       directGroup: directGroup.toString(),
//       connectedDigitalIdentityId: connectedDigitalIdentityId.toString(),
//       ...!!jobTitle && { jobTitle },
//       // hierarchy: hierarchy.value(),
//       // hierarchyIds: hierarchyIds.map(id => id.toString()),
//     };
//   }

//   get roleId() {
//     return this.payload.roleId;
//   }
//   get connectedDigitalIdentityId() {
//     return this.payload.connectedDigitalIdentityId;
//   }
//   get jobTitle() {
//     return this.payload.jobTitle;
//   }
//   get directGroup() {
//     return this.payload.directGroup;
//   }
//   // get hierarchyIds() {
//   //   return this.payload.hierarchyIds;
//   // }
//   // get hierarchy() {
//   //   return this.payload.hierarchy;
//   // }
// }
