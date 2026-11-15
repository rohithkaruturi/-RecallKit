import { Router } from 'express';
import { generateStudyController } from '../controllers/studyController';

const router = Router();

// POST /api/study/generate
router.post('/generate', generateStudyController);

export default router;
