import { Result, err, ok } from "neverthrow";
import { BasicValueObject } from "../../../core/domain/BasicValueObject";
import config from "config";

// TODO: maybe inject config to a factory class that creates sources
const sources: string[] = config.get('valueObjects.source.values');
export const upnSource: string = config.get('valueObjects.source.upnSource');

export class Source extends BasicValueObject<string>{

  private static isValid(source: string) {
    return sources.includes(source);
    // return true TODO: fix unsafeWrap error specific at source
  }

  public static create(source: string): Result<Source, string> {
    if(!Source.isValid(source)) {
      return err(`invalid source: ${source}`);
    }
    return ok(new Source(source));
  }

  public isUpnSource() {
    return this.value === upnSource;
    // return true TODO: fix unsafeWrap error specific at source
  }
}

