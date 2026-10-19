import { Router } from 'express';
import usersRouter from './users.js';
import todosRouter from './todos.js';

const router = Router();

router.use('/users', usersRouter);
router.use('/todos', todosRouter);

export default router;