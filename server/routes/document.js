import express from 'express';
import passport from 'passport';
import rolesMiddleware from '../helpers/roles-middleware';
import documentController from '../controllers/document';

const router = express.Router(); // eslint-disable-line new-cap
const requireAuth = passport.authenticate('bearer', {
  session: false
});

const user = rolesMiddleware;

router.route('/')
  /** GET /api/documents - Get list of documents */
  .get(requireAuth, user.is('Authenticated'), documentController.list)

  /** POST /api/documents - Create new document */
  .post(requireAuth, user.is('Authenticated'), documentController.create);

router.route('/:documentId')
  /** GET /api/documents/:documentId - Get document */
  .get(requireAuth, user.is('Authenticated'), documentController.get)

  /** PUT /api/documents/:documentId - Update document */
  .put(requireAuth, user.is('Authenticated'), documentController.update)

  /** DELETE /api/users/:documentId - Delete document */
  .delete(requireAuth, user.is('Authenticated'), documentController.remove);

router.route('/:documentId/upload')
  /** POST /api/documents/:documentId/upload - Upload file */
  .post(requireAuth, user.is('Authenticated'), documentController.upload);

/** Load document when API with document_Id route parameter is hit */
router.param('documentId', documentController.load);

export default router;
