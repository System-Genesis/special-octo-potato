import { Group } from "../../domain/Group"

export type GroupResultDTO = {
  id: string;
  // name: string;
  // source: string;
  // parentId?: string;
  // akaUnit?: string;
}

export const groupToDTO: (g: Group) => GroupResultDTO = group => ({
  id: group.groupId.toString(),
  // name: group.name,
  // source: group.source.value,
  // parentId: group.parentId?.toString(),
  // akaUnit: group.akaUnit,
});
