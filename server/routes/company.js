import express from 'express';
import passport from 'passport';
import rolesMiddleware from '../helpers/roles-middleware';
import companyController from '../controllers/company';

const router = express.Router(); // eslint-disable-line new-cap
const requireAuth = passport.authenticate('bearer', {
  session: false
});

const user = rolesMiddleware;

router.route('/')
  /** GET /api/companies - Get list of companies */
  .get(requireAuth, user.is('Authenticated'), companyController.list)

  /** POST /api/companies - Create new company */
  .post(requireAuth, user.is('Authenticated'), companyController.create);

router.route('/:companyId')
  /** GET /api/companies/:companyId - Get company */
  .get(requireAuth, user.is('Authenticated'), companyController.get)

  /** PUT /api/companies/:companyId - Update company */
  .put(requireAuth, user.is('Authenticated'), companyController.update)

  /** DELETE /api/users/:companyId - Delete company */
  .delete(requireAuth, user.is('Authenticated'), companyController.remove);

/** Load company when API with company_Id route parameter is hit */
router.param('companyId', companyController.load);

export default router;
