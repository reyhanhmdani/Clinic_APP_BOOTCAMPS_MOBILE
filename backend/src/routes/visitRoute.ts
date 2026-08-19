import { Router } from 'express';
import {
  createVisitController,
  getAllVisitController,
  getVisitByIdController,
  updateVisitController,
} from '../controllers/visitController.js';
import { validateZod } from '../middlewares/validateZod.js';
import { authorization } from '../middlewares/authorization.js';
import { createVisitSchema, updateVisitSchema } from '../validation/visitSchema.js';

const router = Router();

router.use(authorization('ADMIN'));

router.get('/', getAllVisitController);
router.post('/', validateZod(createVisitSchema), createVisitController);
router.get('/:idVisit', getVisitByIdController);
router.patch('/:idVisit', validateZod(updateVisitSchema), updateVisitController);

export default router;
