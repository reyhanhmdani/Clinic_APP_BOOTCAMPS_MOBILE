import { Router } from 'express';
import {
  createConsultationController,
  getAllConsultationController,
  getConsultationByIdController,
  updateConsultationController,
} from '../controllers/consultationController.js';
import { authorization } from '../middlewares/authorization.js';
import { validateZod } from '../middlewares/validateZod.js';
import { createConsultationSchema, updateConsultationSchema } from '../validation/consultationSchema.js';

const router = Router();

router.use(authorization('ADMIN'));

router.get('/', getAllConsultationController);
router.post('/', validateZod(createConsultationSchema), createConsultationController);
router.get('/:idConsultation', getConsultationByIdController);
router.patch('/:idConsultation', validateZod(updateConsultationSchema), updateConsultationController);

export default router;
