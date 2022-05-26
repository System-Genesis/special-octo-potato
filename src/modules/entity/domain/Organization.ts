import { Result, err, ok } from "neverthrow";
import { BasicValueObject } from "../../../core/domain/BasicValueObject";
import config from "config";

// TODO: maybe inject config to a factory class that creates ranks
const organizations: string[] = config.get('valueObjects.organizations.values');

export class Organization extends BasicValueObject<string>{

  private static isValid(organization: string) {
    return organizations.includes(organization);
  }

  public static create(organization: string): Result<Organization, string> {
    if(!Organization.isValid(organization)) {
      return err(`invalid organization: ${organization}`);
    }
    return ok(new Organization(organization));
  }

}
