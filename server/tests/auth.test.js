import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import User from '../models/user';
import Client from '../models/client';
import app from '../../index';

chai.config.includeStack = true;

describe('## Auth APIs', () => {
  const authUser = {
    username: 'test@test.cl',
    password: 'asdasd',
    grant_type: 'password',
    client_id: '610568207243-ke7panhfemrs18dov7tlado9fqkad4nf.apps.googleusercontent.com',
    client_secret: 'o_90vbfKufk8rn3tqXHDpJno'
  };
  let user = {
    username: 'test@test.cl',
    password: 'asdasd'
  };
  let client = {
    id: '610568207243-ke7panhfemrs18dov7tlado9fqkad4nf.apps.googleusercontent.com',
    secret: 'o_90vbfKufk8rn3tqXHDpJno',
    name: 'cliente de prueba'
  };

  describe('# GET /api/auth/oauth/token', () => {
    let refreshtoken = '';
    // create test user
    before((done) => {
      request(app)
        .post('/api/users')
        .send(user)
        .end((err, res) => {
          user = res.body;
          if (err) {
            // console.log(err);
            done(err);
          }
          // console.log(res.body);
          done();
        });
    });
    before((done) => {
      request(app)
        .post('/api/clients')
        .send(client)
        .end((err, res) => {
          client = res.body;
          if (err) {
            // console.log(err);
            done(err);
          }
          // console.log(res.body);
          done();
        });
    });
    after((done) => {
      User.collection.drop();
      Client.collection.drop();
      done();
    });

    it('should not receive a valid token because the client secret are incorrect', (done) => {
      authUser.client_secret = 'laclavesecretaerronea';
      request(app)
        .post('/api/auth/oauth/token')
        .send(authUser)
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.text).to.equal('Unauthorized');
          done();
        })
        .catch(done);
    });

    it('should not receive a valid token because the username are incorrect', (done) => {
      authUser.username = 'error@error.cl';
      authUser.client_secret = 'o_90vbfKufk8rn3tqXHDpJno';
      request(app)
        .post('/api/auth/oauth/token')
        .send(authUser)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.error).to.equal('invalid_grant');
          done();
        })
        .catch(done);
    });

    it('should receive a valid token', (done) => {
      authUser.username = 'test@test.cl';
      request(app)
        .post('/api/auth/oauth/token')
        .send(authUser)
        .expect(httpStatus.OK)
        .then((res) => {
          const result = JSON.parse(res.text);
          refreshtoken = result.refresh_token;
          done();
        })
        .catch(done);
    });

    it('should receive a valid refreshtoken', (done) => {
      authUser.grant_type = 'refresh_token';
      authUser.refresh_token = refreshtoken;
      authUser.username = null;
      authUser.password = null;
      request(app)
        .post('/api/auth/oauth/token')
        .send(authUser)
        .expect(httpStatus.OK)
        .then((res) => {
          const result = JSON.parse(res.text);
          expect(result.token_type).to.equal('Bearer');
          done();
        })
        .catch(done);
    });
  });
});
