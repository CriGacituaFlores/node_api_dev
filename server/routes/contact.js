import express from 'express';
import passport from 'passport';
import rolesMiddleware from '../helpers/roles-middleware';
import contactController from '../controllers/contact';

const router = express.Router(); // eslint-disable-line new-cap
const requireAuth = passport.authenticate('bearer', {
  session: false
});

const user = rolesMiddleware;

router.route('/')
  /** GET /api/companies - Get list of companies */
  .get(requireAuth, user.is('Authenticated'), contactController.list)

  /** POST /api/companies - Create new contact */
  .post(requireAuth, user.is('Authenticated'), contactController.create);

router.route('/:contactId')
  /** GET /api/companies/:contactId - Get contact */
  .get(requireAuth, user.is('Authenticated'), contactController.get)

  /** PUT /api/companies/:contactId - Update contact */
  .put(requireAuth, user.is('Authenticated'), contactController.update)

  /** DELETE /api/users/:contactId - Delete contact */
  .delete(requireAuth, user.is('Authenticated'), contactController.remove);

/** Load contact when API with contact_Id route parameter is hit */
router.param('contactId', contactController.load);

export default router;
