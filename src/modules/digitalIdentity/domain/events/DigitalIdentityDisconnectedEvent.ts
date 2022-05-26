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
//   disconnectedEntityId: EntityId;
// }

// export class DigitalIdentityDisconnectedEvent extends DomainEvent<DIEventPayload> {
 
//   toPlainObject(): object {
//     const {
//       source,
//       mail,
//       type,
//       disconnectedEntityId,
//       uniqueId,
//     } = this.payload;
//     return {
//       type,
//       source: source.value,
//       disconnectedEntityId: disconnectedEntityId.toString(),
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
//   get disconnectedEntityId() {
//     return this.payload.disconnectedEntityId;
//   }
//   get uniqueId() {
//     return this.payload.uniqueId;
//   }
// }
