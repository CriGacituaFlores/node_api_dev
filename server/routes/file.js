import express from 'express';
import passport from 'passport';
import rolesMiddleware from '../helpers/roles-middleware';
import fileController from '../controllers/file';

const router = express.Router(); // eslint-disable-line new-cap
const requireAuth = passport.authenticate('bearer', {
  session: false
});

const user = rolesMiddleware;

router.route('/')
  /** GET /api/files - Get list of files */
  .get(requireAuth, user.is('Authenticated'), fileController.list);

router.route('/:fileId')
  /** GET /api/files/:fileId - Get file */
  .get(requireAuth, user.is('Authenticated'), fileController.get)
  /** DELETE /api/users/:fileId - Delete file */
  .delete(requireAuth, user.is('Authenticated'), fileController.remove);

/** POST /api/files/:fileId/download - Upload file */
router.route('/:fileId/download').get(fileController.download);

/** Load file when API with file_Id route parameter is hit */
router.param('fileId', fileController.load);

export default router;
