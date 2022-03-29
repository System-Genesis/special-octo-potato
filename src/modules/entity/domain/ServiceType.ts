import { Result, err, ok } from 'neverthrow';
import { BasicValueObject } from '../../../core/domain/BasicValueObject';
import config from 'config';

// TODO: maybe inject config to a factory class that creates service types
const serviceTypes: string[] = config.get('valueObjects.serviceType.values');

export class ServiceType extends BasicValueObject<string> {
    private static isValid(serviceType: string) {
        return serviceTypes.includes(serviceType);
    }

    public static create(serviceType: string): Result<ServiceType, string> {
        if (!ServiceType.isValid(serviceType)) {
            return err(`invalid service Type: ${serviceType}`);
        }
        return ok(new ServiceType(serviceType));
    }
}
