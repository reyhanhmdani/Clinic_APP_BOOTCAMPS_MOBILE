import express from 'express';
import authRoutes from './authRoute.js';
import patientRoutes from './patientRoute.js';
import doctorRoutes from './doctorRoute.js';
import medicineRoutes from './medicineRoute.js';
import visitRoutes from './visitRoute.js';
import invoiceRoutes from './invoiceRoute.js';
import consultationRoutes from './consultationRoute.js';
import { authentication } from '../middlewares/authentication.js';

const mainRouter = express.Router();

// Public route (Authentication)
mainRouter.use('/auth', authRoutes);

// Kita jaga semua route harus login dulu
mainRouter.use(authentication);

// Sub-routers, di dalam dalam tiap route terpasang authorization nya juga
mainRouter.use('/patients', patientRoutes);
mainRouter.use('/doctors', doctorRoutes);
mainRouter.use('/medicines', medicineRoutes);
mainRouter.use('/visits', visitRoutes);
mainRouter.use('/consultations', consultationRoutes);
mainRouter.use('/invoices', invoiceRoutes);

export default mainRouter;
