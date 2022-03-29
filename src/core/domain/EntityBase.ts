import { UniqueEntityId } from './UniqueEntityId';

const isEntity = (v: any): v is EntityBase => v instanceof EntityBase;

export abstract class EntityBase {
    protected readonly id: UniqueEntityId;

    constructor(id: UniqueEntityId) {
        this.id = id;
    }

    public equals(obj?: EntityBase): boolean {
        if (obj == null || obj == undefined) {
            return false;
        }
        if (this === obj) {
            return true;
        }
        if (!isEntity(obj)) {
            return false;
        }

        return this.id.equals(obj.id);
    }
}
