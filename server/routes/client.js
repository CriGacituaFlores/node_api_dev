import express from 'express';
import validate from 'express-validation';
import passport from 'passport';
import rolesMiddleware from '../helpers/roles-middleware';
import { clientValid as paramValidation } from '../../config/param-validation';
import clientController from '../controllers/client';

const router = express.Router(); // eslint-disable-line new-cap
const requireAuth = passport.authenticate('bearer', {
  session: false
});

const user = rolesMiddleware;

router.route('/')
  /** GET /api/clients - Get list of clients */
  .get(requireAuth, user.is('Authenticated'), user.is('admin'), clientController.list)

  /** POST /api/clients - Create new client */
  .post(validate(paramValidation.createClient), clientController.create);

router.route('/:clientId')
  /** GET /api/clients/:clientId - Get client */
  .get(requireAuth, user.is('Authenticated'), user.is('admin'), clientController.get)

  /** PUT /api/clients/:clientId - Update client */
  .put(requireAuth, user.is('Authenticated'), user.is('admin'), validate(paramValidation.updateClient), clientController.update)

  /** DELETE /api/users/:clientId - Delete client */
  .delete(requireAuth, user.is('Authenticated'), user.is('admin'), user.is('Authenticated'), user.is('admin'), clientController.remove);

/** Load client when API with client_Id route parameter is hit */
router.param('clientId', clientController.load);

export default router;
