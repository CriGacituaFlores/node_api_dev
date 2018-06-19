import express from 'express';
import passport from 'passport';
import rolesMiddleware from '../helpers/roles-middleware';
import taskController from '../controllers/task';

const router = express.Router(); // eslint-disable-line new-cap
const requireAuth = passport.authenticate('bearer', {
  session: false
});

const user = rolesMiddleware;

router.route('/')
  /** GET /api/tasks - Get list of tasks */
  .get(requireAuth, user.is('Authenticated'), taskController.list)

/** POST /api/tasks - Create new task */
.post(requireAuth, user.is('Authenticated'), taskController.create);

router.route('/:taskId')
  /** GET /api/tasks/:taskId - Get task */
  .get(requireAuth, user.is('Authenticated'), taskController.get)

/** PUT /api/tasks/:taskId - Update task */
.put(requireAuth, user.is('Authenticated'), taskController.update)

/** DELETE /api/users/:taskId - Delete task */
.delete(requireAuth, user.is('Authenticated'), taskController.remove);

/** Load task when API with task_Id route parameter is hit */
router.param('taskId', taskController.load);

export default router;
