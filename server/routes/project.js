import express from 'express';
import passport from 'passport';
import rolesMiddleware from '../helpers/roles-middleware';
import projectController from '../controllers/project';

const router = express.Router(); // eslint-disable-line new-cap
const requireAuth = passport.authenticate('bearer', {
  session: false
});

const user = rolesMiddleware;

router.route('/')
  /** GET /api/projects - Get list of projects */
  .get(requireAuth, user.is('Authenticated'), projectController.list)

  /** POST /api/projects - Create new project */
  .post(requireAuth, user.is('Authenticated'), projectController.create);

router.route('/:projectId')
  /** GET /api/projects/:projectId - Get project */
  .get(requireAuth, user.is('Authenticated'), projectController.get)

  /** PUT /api/projects/:projectId - Update project */
  .put(requireAuth, user.is('Authenticated'), projectController.update)

  /** DELETE /api/users/:projectId - Delete project */
  .delete(requireAuth, user.is('Authenticated'), projectController.remove);

/** Load project when API with project_Id route parameter is hit */
router.param('projectId', projectController.load);

export default router;
