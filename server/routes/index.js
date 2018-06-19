import express from 'express';
import userRoutes from './user';
import authRoutes from './auth';
import clientRoutes from './client';
import companyRoutes from './company';
import documentRoutes from './document';
import projectRoutes from './project';
import fileRoutes from './file';
import taskRoutes from './task';
import storyRoutes from './story';
import contactRoutes from './contact';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount client routes at /clients
router.use('/clients', clientRoutes);

// mount user routes at /users
router.use('/users', userRoutes);

// mount client routes at /companies
router.use('/companies', companyRoutes);

// mount client routes at /projects
router.use('/projects', projectRoutes);

// mount client routes at /documents
router.use('/documents', documentRoutes);

// mount client routes at /files
router.use('/files', fileRoutes);

// mount client routes at /tasks
router.use('/tasks', taskRoutes);

// mount client routes at /stories
router.use('/stories', storyRoutes);

// mount client routes at /contacts
router.use('/contacts', contactRoutes);

export default router;
