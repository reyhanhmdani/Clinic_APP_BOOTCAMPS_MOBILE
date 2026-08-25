import { Router } from 'express';
import { validateZod } from '../middlewares/validateZod.js';
import { authorization } from '../middlewares/authorization.js';
import {
  createPatientController,
  deletePatientController,
  getAllPatientsController,
  getPatientByIdController,
  getPatientHistoryController,
  updatePatientController,
} from '../controllers/patientController.js';
import { createPatientSchema, updatePatientSchema } from '../validation/patientSchema.js';

const router = Router();

router.use(authorization('ADMIN'));

router.get('/', getAllPatientsController);
router.post('/', validateZod(createPatientSchema), createPatientController);
router.get('/:idPatient', getPatientByIdController);
router.get('/:idPatient/history', getPatientHistoryController);
router.patch('/:idPatient', validateZod(updatePatientSchema), updatePatientController);
router.delete('/:idPatient', deletePatientController);

export default router;
