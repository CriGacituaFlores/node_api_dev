import express from 'express';
import * as oauth2 from '../../config/oauth2';

const router = express.Router(); // eslint-disable-line new-cap

// =========================
// Auth Routes
// =========================

// router endpoints pasan por los metodos de oauth2
router.post('/oauth/token', oauth2.token);

export default router;
