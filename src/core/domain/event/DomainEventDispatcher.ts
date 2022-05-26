// import { IDomainEvent } from "./IDomainEvent";
// import { IEventHandler } from "./IEventHandler";

// export class DomainEventDispatcher {
//   private static handlersMap: {[eventName: string]: IEventHandler<IDomainEvent>[]} = {}

//   public static register(eventName: string, handler: IEventHandler<IDomainEvent>) {
//     if(!!DomainEventDispatcher.handlersMap[eventName]) {
//       DomainEventDispatcher.handlersMap[eventName] = [];
//     }
//     DomainEventDispatcher.handlersMap[eventName].push(handler);
//   }

//   static async dispatch(event: IDomainEvent) {
//     if(!!DomainEventDispatcher.handlersMap[event.eventType]) {
//       await Promise.all(DomainEventDispatcher.handlersMap[event.eventType]
//         .map(handler => handler.handle(event)));
//     }
//   }
// }