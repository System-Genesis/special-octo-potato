import { DigitalIdentityService } from "./DigitalIdentityService";
import { digitalIdentityRepository } from "../repository";
import { roleRepository } from "../../Role/repository";

export const digitalIdentityService = new DigitalIdentityService(digitalIdentityRepository,roleRepository);
