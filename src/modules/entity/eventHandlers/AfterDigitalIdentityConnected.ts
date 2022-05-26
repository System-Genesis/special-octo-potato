// import { IEventHandler } from "../../../core/domain/event/IEventHandler";
// import { DigitalIdentityConnectedEvent } from "../../digitalIdentity/domain/events/DigitalIdentityConnectedEvent";
// import { DigitalIdentityDisconnectedEvent } from "../../digitalIdentity/domain/events/DigitalIdentityDisconnectedEvent";
// import { DigitalIdentityRepository } from "../../digitalIdentity/repository/DigitalIdentityRepository";
// import { PrimaryDigitalIdentityService, DigitalIdentityObject } from "../domain/PrimaryDigitalIdentityService";
// import { EntityRepository } from "../repository/EntityRepository";

// export class AfterDigitalIdentityConnected 
// implements IEventHandler<
//   DigitalIdentityConnectedEvent | 
//   DigitalIdentityDisconnectedEvent
// > {
  
//   constructor(
//     private _entityRepository: EntityRepository,
//     private _diRepository: DigitalIdentityRepository,
//     private _primaryChooserService: PrimaryDigitalIdentityService   
//   ){}
  
//   setupSubscriptions(): void {
//   }

//   async handle(
//     domainEvent: DigitalIdentityConnectedEvent | DigitalIdentityDisconnectedEvent
//   ) {
//     const entityId = domainEvent instanceof DigitalIdentityConnectedEvent ?
//       domainEvent.connectedEntityId : domainEvent.disconnectedEntityId; 
//     const entity = await this._entityRepository.getByEntityId(entityId);
//     if(!entity) { return; }
//     const connectedDIs = await this._diRepository.getByEntityId(entityId);
//     this._primaryChooserService.choosePrimaryDigitalIdentity(
//       entity, 
//       connectedDIs as unknown as DigitalIdentityObject[] // dirty trick
//     );
//     await this._entityRepository.save(entity);
//   }

// }