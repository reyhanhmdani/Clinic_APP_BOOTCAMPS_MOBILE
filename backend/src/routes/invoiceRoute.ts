import { Router } from 'express';
import {
  createInvoiceController,
  getAllInvoiceController,
  getInvoiceByIdController,
  payInvoiceController,
} from '../controllers/invoiceController.js';
import { validateZod } from '../middlewares/validateZod.js';
import { createInvoiceSchema, payInvoiceSchema } from '../validation/invoiceSchema.js';
import { authorization } from '../middlewares/authorization.js';

const router = Router();

router.use(authorization('ADMIN'));

router.get('/', getAllInvoiceController);
router.post('/', validateZod(createInvoiceSchema), createInvoiceController);
router.get('/:idInvoice', getInvoiceByIdController);
router.patch('/:idInvoice/pay', validateZod(payInvoiceSchema), payInvoiceController);

export default router;
