import { GroupId } from "./GroupId";
import { Source } from "../../digitalIdentity/domain/Source";

export interface IGroup {
  name: string;
  source: Source; 
  akaUnit?: string;
  // hierarchy: string;
  ancestors: GroupId[];
  groupId: GroupId;
  status?: string;
  diPrefix?: string;
  isLeaf: boolean;
}