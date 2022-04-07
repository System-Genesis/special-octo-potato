import { Source } from './../../digitalIdentity/domain/Source';
import { DigitalIdentityId } from './../../digitalIdentity/domain/DigitalIdentityId';
// import { DigitalIdentityId } from "./DigitalIdentityId";
// import { Source } from "./Source";

export interface IConnectedDI {
    uniqueId: DigitalIdentityId;
    source: Source;
}
