import crypto from 'crypto';
import User from '../models/user';
import AccessToken from '../models/accesstoken';
import * as emailSender from '../helpers/emailSender';

function me(req, res) {
  let _user;
  if (req.user) {
    _user = Object.assign({}, req.user._doc);
    delete _user.password;
    delete _user.__v;
  } else {
    _user = {};
  }
  return res.json(_user);
}

/**
 * Load user and append to req.
 */
function load(req, res, next, id) {
  User.get(id)
    .then((user) => {
      req.u = user; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get user
 * @returns {User}
 */
function get(req, res) {
  return res.json(req.u);
}

/**
 * Create new user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.password - The password of user.
 * @returns {User}
 */
function create(req, res, next) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
    profile: {
      firstName: req.body.firstName,
      lastName: req.body.lastName
    },
    role: req.body.role,
    verified: false
  });

  user.save()
    .then((savedUser) => {
      const _user = savedUser;
      delete _user.password;
      res.json(_user);
    })
    .catch(e => next(e));
}

/**
 * Update existing user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.password - The password of user.
 * @returns {User}
 */
function update(req, res, next) {
  const user = req.user;
  user.username = req.body.username || user.username;
  if (req.body.password) {
    user.password = req.body.password;
  }
  user.profile = {
    firstName: req.body.firstName || user.profile.firstName,
    lastName: req.body.lastName || user.profile.lastName
  };
  user.role = req.body.role || user.role;
  user.verified = req.body.verified && user.verified;
  user.email_verification_attempts = req.body.email_verification_attempts ||
    user.email_verification_attempts;
  user.save()
    .then((savedUser) => {
      const _user = savedUser;
      delete _user.password;
      res.json(_user);
    }).catch(e => next(e));
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
  const query = {};
  if (req.query.username) {
    query.username = req.query.username;
  }
  if (req.query.role) {
    query.role = req.query.role;
  }
  User.list(query, parseInt(req.query.skip || 0, 10), parseInt(req.query.limit || 50, 10))
    .then(users => res.json(users))
    .catch(e => next(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res, next) {
  const user = req.user;
  user.remove()
    .then(deletedUser => res.json(deletedUser))
    .catch(e => next(e));
}

/**
 * Get List meters from User
 * @param req
 * @param res
 * @param next
 * @return {object} result
 */
function listMeters(req, res, next) {
  const result = {};
  const user = req.user;
  const query = {};
  result.success = true;

  if (user.role === 'admin') {
    query.username = req.query.username || user.username;
  }

  User.findOne(query)
    .then((_user) => {
      if (!_user) {
        return res.status(400).json({ message: 'Bad Request' });
      }
      return res.json({ success: true, meters: _user.meters });
    })
    .catch(err => next(err));
}

/**
 * Sign In a new user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.password - The password of user.
 * @returns {User}
 */
function signIn(req, res, next) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
    profile: {
      firstName: req.body.firstName,
      lastName: req.body.lastName
    }
  });
  const sendVerification = (savedUser) => {
    // send email verification
    emailSender.sendVerificationEmail(savedUser.username, savedUser.email_verification_pin);
    return savedUser;
  };

  User.findOne({ $or: [{ username: user.username }] })
    .then((_user) => {
      if (_user) {
        return res.status(400).json({ message: 'username taken' });
      }
      const buf = crypto.randomBytes(3);
      user.email_verification_pin = buf.toString('hex');
      return user.save()
        .then(savedUser => sendVerification(savedUser))
        .then((savedUser) => {
          const _userTmp = savedUser;
          delete _userTmp.password;
          res.json(_userTmp);
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
}

/**
 * Verify an account when it was created
 * @param req
 * @param res
 * @return {*}
 */
function verifyEmail(req, res) {
  const delayAfter3Attempts = 10000;
  const pin = req.body.pin;
  const user = req.user;

  if (user.verified) {
    return res.json({ success: true });
  }

  const verifyPin = (userPin) => {
    if (userPin === pin) user.verified = true;
    else {
      user.email_verification_attempts += 1;
      user.last_email_verification_attempt = new Date().getTime();
    }
    return user.save()
      .then((savedUser) => {
        if (!savedUser.verified) {
          return res.json({ success: false, message: 'Wrong pin' });
        }
        return res.json({ success: true });
      });
  };

  if (user.email_verification_attempts >= 3) {
    const lastVerification = user.last_email_verification_attempt;
    const currentDate = new Date().getTime();
    if ((currentDate - lastVerification) >= delayAfter3Attempts) {
      verifyPin(user.email_verification_pin);
    } else {
      res.json({ success: false, error: 'max requests exceeded' });
    }
  } else {
    verifyPin(user.email_verification_pin);
  }
  return false;
}

/**
 * Delete token user for revoke the access to endpoints
 * @param req
 * @param res
 * @param next
 */
function revokeToken(req, res, next) {
  const user = req.user;
  const revokeAll = req.body.revokeAll;

  if (revokeAll && user.role === 'admin') {
    return AccessToken.remove({ username: user.username })
      .then(() => res.json({ success: true }))
      .catch(err => next(err));
  }

  const tokenUser = User.getUserToken(req.headers);
  return AccessToken.remove({ token: tokenUser[1] })
    .then(() => res.json({ success: true }))
    .catch(err => next(err));
}

function requestResetPassword(req, res, next) {
  const username = req.body.username;

  const generateTokenReset = () => crypto.randomBytes(32).toString('hex');

  const sendEmailResetToken = (user) => {
    emailSender.sendPasswordResetEmail(user.username, user.resetPasswordToken);
    return res.json({ success: true });
  };

  const saveTokenReset = (user) => {
    const _user = user;
    if (!_user) {
      return res.status(400).json({ message: 'User not found' });
    }
    _user.resetPasswordToken = generateTokenReset();
    _user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    return _user.save()
      .then((userSaved) => {
        sendEmailResetToken(userSaved);
      })
      .catch(err => next(err));
  };

  User.findOne({ username })
    .then(user => saveTokenReset(user))
    .catch(err => next(err));
}

function changePassword(req, res, next) {
  const token = req.headers.resetpasswordtoken;

  const sendEmailPasswordChanged = (user) => {
    emailSender.sendConfirmationChangePassword(user.username);
    return res.json({ success: true });
  };

  User.findOne({ resetPasswordToken: token })
    .then((user) => {
      const _user = user;
      if (!_user) {
        return res.status(400).json({ message: 'User not found' });
      }
      if (Date.now() > _user.resetPasswordExpires) {
        return res.status(400).json({ message: 'token expired' });
      }

      _user.password = req.body.password;
      _user.resetPasswordToken = undefined;
      _user.resetPasswordExpires = undefined;

      return _user.save()
        .then(userSaved => sendEmailPasswordChanged(userSaved))
        .catch(err => next(err));
    })
    .catch(err => next(err));
}

export default {
  load,
  get,
  create,
  update,
  list,
  remove,
  me,
  listMeters,
  signIn,
  verifyEmail,
  revokeToken,
  requestResetPassword,
  changePassword
};
