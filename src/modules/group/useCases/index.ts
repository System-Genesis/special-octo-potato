import { groupRepository } from "../repository";
import { roleRepository } from "../../Role/repository";
import { GroupService } from "./GroupService";

export const groupService = new GroupService(groupRepository,roleRepository);
