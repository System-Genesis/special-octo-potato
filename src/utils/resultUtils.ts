import { err, ok, Result } from "neverthrow";
import { BaseError } from "../core/logic/BaseError";

const wrapResult = (result : Result<any, any>) => {
    if(result.isOk()) {
        return result.value;
    } 
}

export { wrapResult }