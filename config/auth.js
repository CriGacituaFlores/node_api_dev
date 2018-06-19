import passport from 'passport';
import { BasicStrategy } from 'passport-http';

import * as ClientPasswordStrategy from 'passport-oauth2-client-password';
import * as BearerStrategy from 'passport-http-bearer';

import User from '../server/models/user';
import Client from '../server/models/client';
import AccessToken from '../server/models/accesstoken';


passport.use(new BasicStrategy((id, password, done) => {
  Client.findOne({ id }, (err, client) => {
    if (err) { return done(err); }
    if (!client) { return done(null, false); }
    if (client.secret !== password) { return done(null, false); }
    return done(null, client);
  });
}));

passport.use(new ClientPasswordStrategy.Strategy(
  (id, secret, done) => {
    Client.findOne({ id }, (err, client) => {
      if (err) { return done(err); }
      if (!client) { return done(null, false); }
      if (client.secret !== secret) { return done(null, false); }
      return done(null, client);
    });
  }
));

passport.use(new BearerStrategy.Strategy(
    (accessToken, done) => {
      AccessToken.findOne({ token: accessToken }, (err, token) => {
        if (err) { return done(err); }
        if (token) {
          /* if( Math.round((Date.now()-token.created)/1000) > config.get('tokenLife') ) { */
          if (Math.round((Date.now() - token.createdAt) / 1000) > 7200) {
            AccessToken.remove(accessToken, (error) => {
              if (error) return done(error);
              return false;
            });
            return done(null, false, { message: 'Token expired' });
          }

          User.findOne({ username: token.username }, (errorUser, user) => {
            if (errorUser) { return done(errorUser); }
            if (!user) { return done(null, false, { message: 'Unknown user' }); }
            const info = { scope: '*' };

            return done(null, user, info);
          });
        } else {
          return done(null, false);
        }
        return false;
      });
    }
));
