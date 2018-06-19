import oauth2orize from 'oauth2orize';
import passport from 'passport';
import crypto from 'crypto';
// import logger from '../config/winston';
import config from '../config/env';


// MODELOS
import User from '../server/models/user';
import AccessToken from '../server/models/accesstoken';
import RefreshToken from '../server/models/refreshtoken';

// Creamos un servidor de Oauth2
const aserver = oauth2orize.createServer();

// Manejador de errores
const errFn = (cb, err) => { // eslint-disable-line
  if (err) {
    return cb(err);
  }
};

// Destruimos los viejos tokens y refreshtoken y generamos nuevos
function generateTokens(data, done) {
  let errorHandler = errFn.bind(undefined, done); // eslint-disable-line
  let datainfo = data; // eslint-disable-line

  RefreshToken.remove(data, errorHandler);
  AccessToken.remove(data, errorHandler);

  const tokenValue = crypto.randomBytes(32).toString('hex');
  const refreshTokenValue = crypto.randomBytes(32).toString('hex');

  datainfo.token = tokenValue;
  const token = new AccessToken(datainfo);

  datainfo.token = refreshTokenValue;
  const refreshToken = new RefreshToken(datainfo);

  refreshToken.save(errorHandler);

  token.save((err) => {
    if (err) {
      return done(err);
    }

    return done(null, tokenValue, refreshTokenValue, {
      expires_in: config.expire_in
    });
  });
}
// cambio username, password y client por accesstoken
aserver.exchange(oauth2orize.exchange.password((client, username, password, scope, done) => {
  // console.log('client:', client);
  // console.log('username:', username);
  // console.log('password:', password);
  User.findOne({ username }, (err, user) => {
    if (err) {
      return done(err);
    }

    if (!user) {
      return done(null, false);
    }

    return user.comparePassword(password, (error, isMatch) => {
      if (err) {
        return done(err);
      }
      if (!isMatch) {
        return done(null, false);
      } else { // eslint-disable-line no-else-return
        const model = {
          username: user.username,
          clientId: client.id
        };
        return generateTokens(model, done);
      }
    });
  });
}));

// cambio refreshtoken por nuevo accesstoken
aserver.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
  RefreshToken.findOne({ token: refreshToken, clientId: client.id }, (err, token) => {
    if (err) {
      return done(err);
    }

    if (!token) {
      return done(null, false);
    }

    User.findOne({ username: token.username }, (error, user) => {
      if (error) {
        return done(error);
      }
      if (!user) {
        return done(null, false);
      }

      const model = {
        username: user.username,
        clientId: client.id
      };

      generateTokens(model, done);
      return false;
    });
    return false;
  });
}));

// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

exports.token = [
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  aserver.token(),
  aserver.errorHandler()
];
