// import { IDomainEvent } from "../../../../core/domain/event/IDomainEvent";
// import { DomainEvent } from "../../../../core/domain/event/DomainEvent";
// import { DigitalIdentityType } from "../DigitalIdentity";
// import { DigitalIdentityId } from "../DigitalIdentityId";
// import { EntityId } from "../../../entity/domain/EntityId";
// import { Mail } from "../Mail";
// import { Source } from "../Source";

// type DIEventPayload = {
//   uniqueId: DigitalIdentityId;
//   source: Source;
//   mail?: Mail;
//   type: DigitalIdentityType;
//   connectedEntityId: EntityId;
//   canConnectRole: boolean;
// }

// export class DigitalIdentityConnectedEvent extends DomainEvent<DIEventPayload> {

//   toPlainObject(): object {
//     const {
//       source,
//       mail,
//       type,
//       connectedEntityId,
//       uniqueId,
//       canConnectRole
//     } = this.payload;
//     return {
//       type,
//       canConnectRole,
//       source: source.value,
//       connectedEntityId: connectedEntityId.toString(),
//       uniqueId: uniqueId.toString(),
//       ...!!mail && { mail: mail.value }
//     };
//   }

//   get mail() {
//     return this.payload.mail;
//   }
//   get source() {
//     return this.payload.source;
//   }
//   get type() {
//     return this.payload.type;
//   }
//   get connectedEntityId() {
//     return this.payload.connectedEntityId;
//   }
//   get uniqueId() {
//     return this.payload.uniqueId;
//   }
//   get canConnectRole() {
//     return this.payload.canConnectRole;
//   }
// }
