import { EntityController } from './EntityController';
import { entityService } from '../../useCases';
import { Router } from 'express';

const entityController = new EntityController(entityService);
const router = Router();

router.post('/', entityController.createEntity);
router.patch('/:id', entityController.updateEntity);
router.put('/:id/digitalIdentity/:uniqueId', entityController.connectDigitalIdentity);
router.delete('/:id/digitalIdentity/:uniqueId', entityController.disconnectDigitalIdentity);
router.delete('/:id', entityController.deleteEntity);

export default router;
