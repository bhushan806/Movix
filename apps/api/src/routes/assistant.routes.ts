import { Router } from 'express';
import * as assistantController from '../controllers/assistant.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.use(protect);

router.post('/chat', assistantController.chat);
router.post('/ask-ai', assistantController.askAi);

export default router;
