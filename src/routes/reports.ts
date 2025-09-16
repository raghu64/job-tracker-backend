import express from 'express';
import auth from '../middleware/auth.js';
import { getReport } from '../controllers/reportController.js';
import role from '../middleware/role.js';

const router = express.Router();

console.log('Reports route loaded');

router.get('/', auth, role(["consultant"]), getReport);

export default router;
