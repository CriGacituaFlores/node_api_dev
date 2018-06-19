import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import User from '../models/user';
import Client from '../models/client';
import AccessToken from '../models/accesstoken';
import RefreshToken from '../models/refreshtoken';
import app from '../../index';

chai.config.includeStack = true;

let client = {
  id: 'clienteprueba',
  secret: 'laclavesecreta',
  name: 'cliente de prueba'
};
let user = {
  username: 'test@test.cl',
  password: 'asdasd'
};
const authUser = {
  username: 'test@test.cl',
  password: 'asdasd',
  grant_type: 'password',
  client_id: '610568207243-ke7panhfemrs18dov7tlado9fqkad4nf.apps.googleusercontent.com',
  client_secret: 'o_90vbfKufk8rn3tqXHDpJno'
};
let _client = {
  id: '610568207243-ke7panhfemrs18dov7tlado9fqkad4nf.apps.googleusercontent.com',
  secret: 'o_90vbfKufk8rn3tqXHDpJno',
  name: 'cliente de prueba'
};
let token = '';

describe('## Client APIs', () => {
  before((done) => {
    request(app)
      .post('/api/users/register')
      .send(user)
      .end((err, res) => {
        user = res.body;
        done();
      });
  });
  before((done) => {
    request(app)
      .post('/api/clients')
      .send(_client)
      .end((err, res) => {
        _client = res.body;
        done();
      });
  });
  before((done) => {
    request(app)
      .post('/api/auth/oauth/token')
      .send(authUser)
      .end((err, res) => {
        const result = JSON.parse(res.text);
        token = 'Bearer ';
        token += result.access_token;
        done();
      });
  });

  describe('# POST /api/clients', () => {
    it('should create a new client', (done) => {
      request(app)
        .post('/api/clients')
        .send(client)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.id).to.equal(client.id);
          client = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/clients/:clientId', () => {
    afterEach((done) => {
      request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', token)
        .send({ role: 'admin' })
        .end(() => {
          done();
        });
    });
    it('should report error with message - Access Denied, when user does not have access by role', (done) => {
      request(app)
        .get(`/api/clients/${client._id}`)
        .set('Authorization', token)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.message).to.equal('Access Denied');
          done();
        })
        .catch(done);
    });
    it('should report error with message - Not found, when client does not exists', (done) => {
      request(app)
        .get('/api/clients/56c787ccc67fc16ccc1a5e92')
        .set('Authorization', token)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        })
        .catch(done);
    });
    it('should get client details', (done) => {
      request(app)
        .get(`/api/clients/${client._id}`)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.id).to.equal(client.id);
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/clients/:clientId', () => {
    it('should update client details', (done) => {
      client.id = 'clienteprueba';
      request(app)
        .put(`/api/clients/${client._id}`)
        .set('Authorization', token)
        .send(client)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.id).to.equal('clienteprueba');
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/clients/', () => {
    it('should get all clients', (done) => {
      request(app)
        .get('/api/clients')
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/clients/:clientId', () => {
    after((done) => {
      User.collection.drop();
      Client.collection.drop();
      AccessToken.collection.drop();
      RefreshToken.collection.drop();
      done();
    });
    it('should delete client', (done) => {
      request(app)
        .delete(`/api/clients/${client._id}`)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.id).to.equal('clienteprueba');
          done();
        })
        .catch(done);
    });
  });
});
