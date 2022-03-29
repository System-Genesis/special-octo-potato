// import { entityRepository } from "../repository";
// import { digitalIdentityRepository } from "../../digitalIdentity/repository";
// import { DomainEventDispatcher } from "../../../core/domain/event/DomainEventDispatcher";
// import { AfterDigitalIdentityConnected } from "./AfterDigitalIdentityConnected";
// import { PrimaryDigitalIdentityService } from "../domain/PrimaryDigitalIdentityService";
// import { DigitalIdentityDisconnectedEvent } from "../../digitalIdentity/domain/events/DigitalIdentityDisconnectedEvent";
// import { DigitalIdentityConnectedEvent } from "../../digitalIdentity/domain/events/DigitalIdentityConnectedEvent";

// const afterDigitalIdentityConnection = new AfterDigitalIdentityConnected(
//   entityRepository,
//   digitalIdentityRepository,
//   new PrimaryDigitalIdentityService() // TODO: maybe static class
// );

// export const registerHandlers = () => {
//   DomainEventDispatcher.register(
//     DigitalIdentityDisconnectedEvent.getEventName(), afterDigitalIdentityConnection);
//   DomainEventDispatcher.register(
//     DigitalIdentityConnectedEvent.getEventName(), afterDigitalIdentityConnection);
// }
