import express from 'express';
import validate from 'express-validation';
import passport from 'passport';
import {
  userValid as paramValidation
} from '../../config/param-validation';
import rolesMiddleware from '../helpers/roles-middleware';
import userController from '../controllers/user';

const router = express.Router(); // eslint-disable-line new-cap
const requireAuth = passport.authenticate('bearer', {
  session: false
});

const user = rolesMiddleware;

router.route('/')
  /** GET /api/users - Get list of users */
  .get(requireAuth, user.is('Authenticated'), user.is('admin'), userController.list)
  /** POST /api/users - Create new user */
  .post(validate(paramValidation.createUser), userController.create);

router.route('/me')
  .get(requireAuth, user.is('Authenticated'), userController.me);

router.route('/register')
/** POST /api/users/register - Register an user */
  .post(validate(paramValidation.createUser), userController.signIn);

router.route('/verifyEmail')
/** POST /api/users/verifyEmail - Verify an account */
  .post(requireAuth, validate(paramValidation.verifyUser), user.is('Authenticated'), userController.verifyEmail);

router.route('/logout')
/** POST /api/users/logout - revoke token of access to user **/
  .post(requireAuth, user.is('Authenticated'), userController.revokeToken);

router.route('/forgotPassword')
/** POST /api/users/forgotPassword - request Reset password **/
  .post(userController.requestResetPassword);

router.route('/changePassword')
/** POST /api/users/changePassword - change Password **/
  .post(userController.changePassword);

router.route('/:userId')
  /** GET /api/users/:userId - Get user */
  .get(requireAuth, user.is('Authenticated'), userController.get)
  /** PUT /api/users/:userId - Update user */
  .put(requireAuth, user.is('Authenticated'), validate(paramValidation.updateUser), userController.update)
  /** DELETE /api/users/:userId - Delete user */
  .delete(requireAuth, user.is('Authenticated'), userController.remove);

/** Load user when API with userId route parameter is hit */
router.param('userId', userController.load);

export default router;
