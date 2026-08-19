import {
  createMedicineController,
  deleteMedicineController,
  getAllMedicineController,
  getMedicineByIdController,
  updateMedicineController,
} from '../controllers/medicineController.js';
import { validateZod } from '../middlewares/validateZod.js';
import { authorization } from '../middlewares/authorization.js';
import { createMedicineSchema, updateMedicineSchema } from '../validation/medicineSchema.js';
import { Router } from 'express';

const router = Router();

router.use(authorization('ADMIN'));

router.get('/', getAllMedicineController);
router.post('/', validateZod(createMedicineSchema), createMedicineController);
router.get('/:idMedicine', getMedicineByIdController);
router.patch('/:idMedicine', validateZod(updateMedicineSchema), updateMedicineController);
router.delete('/:idMedicine', deleteMedicineController);

export default router;
