import { Router } from 'express';
import usersRouter from './users.js';
import todosRouter from './todos.js';
import healthRouter from './health.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/users', usersRouter);
router.use('/todos', todosRouter);

export default router;