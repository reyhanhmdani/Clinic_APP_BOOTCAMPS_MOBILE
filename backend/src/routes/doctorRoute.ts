import { Router } from 'express';
import { validateZod } from '../middlewares/validateZod.js';
import { authorization } from '../middlewares/authorization.js';
import {
  createDoctorController,
  deleteDoctorController,
  getAllDoctorsController,
  getDoctorByIdController,
  updateDoctorController,
} from '../controllers/doctorController.js';
import { createDoctorSchema, updateDoctorSchema } from '../validation/doctorSchema.js';

const router = Router();

router.use(authorization('ADMIN'));

router.get('/', getAllDoctorsController);
router.post('/', validateZod(createDoctorSchema), createDoctorController);
router.get('/:idDoctor', getDoctorByIdController);
router.patch('/:idDoctor', validateZod(updateDoctorSchema), updateDoctorController);
router.delete('/:idDoctor', deleteDoctorController);

export default router;
