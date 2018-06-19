import express from 'express';
import passport from 'passport';
import rolesMiddleware from '../helpers/roles-middleware';
import storyController from '../controllers/story';

const router = express.Router(); // eslint-disable-line new-cap
const requireAuth = passport.authenticate('bearer', {
  session: false
});

const user = rolesMiddleware;

router.route('/')
  /** GET /api/companies - Get list of companies */
  .get(requireAuth, user.is('Authenticated'), storyController.list)

  /** POST /api/companies - Create new story */
  .post(requireAuth, user.is('Authenticated'), storyController.create);

router.route('/:storyId')
  /** GET /api/companies/:storyId - Get story */
  .get(requireAuth, user.is('Authenticated'), storyController.get)

  /** PUT /api/companies/:storyId - Update story */
  .put(requireAuth, user.is('Authenticated'), storyController.update)

  /** DELETE /api/users/:storyId - Delete story */
  .delete(requireAuth, user.is('Authenticated'), storyController.remove);

/** Load story when API with story_Id route parameter is hit */
router.param('storyId', storyController.load);

export default router;
