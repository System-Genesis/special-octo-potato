import { EmployeeNumber } from '../../domain/EmployeeNumber';
import { BaseError } from '../../../../core/logic/BaseError';

export class EmployeeNumberAlreadyExists extends BaseError {
    private constructor(employeeNumber: string, organization: string) {
        super(`Employee Number: ${employeeNumber} already belogns to another entity in organization ${organization}`);
    }

    static create(employeeNumber: string, organization: string) {
        return new EmployeeNumberAlreadyExists(employeeNumber, organization);
    }
}
