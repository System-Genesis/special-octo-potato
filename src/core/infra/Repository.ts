import { Result } from 'neverthrow';
import { AggregateRoot } from '../domain/AggregateRoot';
import { Identifier } from '../domain/Identifier';
import { BaseError } from '../logic/BaseError';
import { AggregateVersionError } from './AggregateVersionError';

export interface Repository<T extends AggregateRoot> {
    save(t: T): Promise<Result<any, AggregateVersionError>>;
    delete(id: Identifier<any>): Promise<Result<any, BaseError>>;
}
