import { GroupController } from './GroupController';
import { groupService } from '../../useCases';
import { Router } from 'express';

const groupController = new GroupController(groupService);
const router = Router();

router.post('/', groupController.createGroup);
router.put('/:id/parent/:parentId', groupController.moveGroup);
router.delete('/:id', groupController.deleteGroup);
router.patch('/:id', groupController.updateGroup);
router.patch('/:id/rename', groupController.renameGroup);

export default router;
