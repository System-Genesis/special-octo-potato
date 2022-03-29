import { EntityBase } from './EntityBase';
import { UniqueEntityId } from './UniqueEntityId';

export abstract class AggregateRoot extends EntityBase {
    private _version: number;
    private _savedVersion: number;

    constructor(id: UniqueEntityId, opts: CreateOpts) {
        super(id);
        if (opts.isNew) {
            this._version = 0;
        } else {
            this._version = opts.savedVersion; // TODO: mybe throw if savedVersion is < 0
        }
        this._savedVersion = this._version;
    }

    protected markModified() {
        if (this._savedVersion === this._version) {
            this._version++;
        }
    }

    get version() {
        return this._version;
    }

    get fetchedVersion() {
        return this._savedVersion;
    }
}

export type CreateOpts =
    | {
          isNew: true;
      }
    | {
          isNew: false;
          savedVersion: number;
      };
