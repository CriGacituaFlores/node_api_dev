import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import { before, after, afterEach, it } from 'mocha';
import User from '../models/user';
import Client from '../models/client';
import app from '../../index';

chai.config.includeStack = true;

describe('## User APIs', () => {
  const authUser = {
    username: 'test@test.cl',
    password: 'asdasd',
    grant_type: 'password',
    client_id: '610568207243-ke7panhfemrs18dov7tlado9fqkad4nf.apps.googleusercontent.com',
    client_secret: 'o_90vbfKufk8rn3tqXHDpJno'
  };
  let user = {
    username: 'test@test.cl',
    password: 'asdasd',
    role: 'admin'
  };

  let user2 = {
    username: 'email@test.cl',
    password: '123456',
    role: 'admin'
  };
  const user3 = {
    username: 'email@tres.cl',
    password: '123456',
    role: 'member'
  };

  let client = {
    id: '610568207243-ke7panhfemrs18dov7tlado9fqkad4nf.apps.googleusercontent.com',
    secret: 'o_90vbfKufk8rn3tqXHDpJno',
    name: 'cliente de prueba'
  };

  const fakeUser = 'email@fake.com';
  let token = '';
  let tokenResetPassword = '';

  describe('# POST /api/users', () => {
    it('should create a new user', (done) => {
      request(app)
        .post('/api/users')
        .send(user)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal(user.username);
          user = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/users', () => {
    const username = 'test@test.cl';
    const role = 'admin';
    before((done) => {
      request(app)
        .post('/api/clients')
        .send(client)
        .end((err, res) => {
          client = res.body;
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
    after((done) => {
      Client.collection.drop();
      done();
    });

    it('should get users found by username', (done) => {
      request(app)
        .get('/api/users')
        .query('username=test@test.cl')
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body[0].username).to.equal(username);
          done();
        })
        .catch(done);
    });

    it('should get users found by role', (done) => {
      request(app)
        .get('/api/users')
        .query('role=admin')
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body[0].role).to.equal(role);
          done();
        })
        .catch(done);
    });

    it('should catch error', (done) => {
      request(app)
        .get('/api/users')
        .query('role=admin')
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body[0].role).to.equal(role);
          done();
        })
        .catch(done);
    });

    it('should get all users', (done) => {
      request(app)
        .get('/api/users')
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/users/:userId', () => {
    const username = 'test@test.cl';
    before((done) => {
      request(app)
        .post('/api/clients')
        .send(client)
        .end((err, res) => {
          client = res.body;
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
    after((done) => {
      Client.collection.drop();
      done();
    });


    it('should not be able to consume the route /api/users/:userId since no token was sent', (done) => {
      request(app)
        .get(`/api/users/${user._id}`)
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.text).to.equal('Unauthorized');
          done();
        })
        .catch(done);
    });

    it('should get user details', (done) => {
      request(app)
        .get(`/api/users/${user._id}`)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal(username);
          done();
        })
        .catch(done);
    });

    it('should get token owner user details', (done) => {
      request(app)
        .get('/api/users/me')
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.role).to.equal('admin');
          done();
        })
        .catch(done);
    });

    it('should report error with message - Not found, when user does not exists', (done) => {
      request(app)
        .get('/api/users/56c787ccc67fc16ccc1a5e92')
        .set('Authorization', token)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/users/:userId', () => {
    before((done) => {
      request(app)
        .post('/api/clients')
        .send(client)
        .end((err, res) => {
          client = res.body;
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
    after((done) => {
      Client.collection.drop();
      done();
    });

    it('should update user details', (done) => {
      user.username = 'test@test.cl';
      user.role = 'admin';
      user.firstName = 'nuevo';
      user.lastName = 'pereira';

      request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', token)
        .send(user)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal('test@test.cl');
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /api/users/register', () => {
    it('should report error with message - username Taken, when user was taken ', (done) => {
      request(app)
        .post('/api/users/register')
        .send(user)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('username taken');
          done();
        })
        .catch(done);
    });
    it('should register a new user with invites previously', (done) => {
      request(app)
        .post('/api/users/register')
        .send(user2)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal(user2.username);
          done();
        })
        .catch(done);
    });
    it('should register a new user without invites previously', (done) => {
      request(app)
        .post('/api/users/register')
        .send(user3)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal(user3.username);
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /api/users/verifyEmail', () => {
    const fakePin = { pin: 'abc123' };
    const userTest = {
      username: 'test@test.cl',
      password: 'asdasd',
      role: 'member'
    };
    before((done) => {
      request(app)
        .delete(`/api/users/${user._id}`)
        .set('Authorization', token)
        .end(() => {
          done();
        });
    });

    before((done) => {
      request(app)
        .post('/api/users/register')
        .send(userTest)
        .end((err, res) => {
          user = res.body;
          done();
        });
    });
    before((done) => {
      request(app)
        .post('/api/clients')
        .send(client)
        .end((err, res) => {
          client = res.body;
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

    it('should get a response OK, but with a message Wrong pin and sum a attempt fail', (done) => {
      request(app)
        .post('/api/users/verifyEmail')
        .send(fakePin)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.message).to.equal('Wrong pin');
          done();
        })
        .catch(done);
    });


    it('should register a correct verify for a new account', (done) => {
      request(app)
        .post('/api/users/verifyEmail')
        .send({ pin: user.email_verification_pin })
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.success).to.equal(true);
          done();
        })
        .catch(done);
    });

    it('should get a response ok when an user was verified ', (done) => {
      request(app)
        .post('/api/users/verifyEmail')
        .send({ pin: user.email_verification_pin })
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.success).to.equal(true);
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /api/users/verifyEmail errors', () => {
    const fakePin = { pin: 'abc123' };

    before((done) => {
      const testUser = {
        verified: false,
        firstName: 'test error',
        email_verification_attempts: 3
      };

      request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', token)
        .send(testUser)
        .end(() => {
          done();
        });
    });

    it('should get verification if last attempt was more than 10 seconds ago, because it was tried more than 3 times ', (done) => {
      request(app)
        .post('/api/users/verifyEmail')
        .send(fakePin)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.error).to.equal('max requests exceeded');
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /api/users/logout', () => {
    afterEach((done) => {
      request(app)
        .post('/api/clients')
        .send(client)
        .end((err, res) => {
          client = res.body;
          done();
        });
    });
    afterEach((done) => {
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


    it('should delete token from user ', (done) => {
      request(app)
        .post('/api/users/logout')
        .send({ revokeAll: false })
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.success).to.equal(true);
          done();
        })
        .catch(done);
    });

    it('should delete all tokens from user by username ', (done) => {
      request(app)
        .post('/api/users/logout')
        .send({ revokeAll: true })
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.success).to.equal(true);
          done();
        })
        .catch(done);
    });
  });
  describe('# DELETE /api/users/:userId', () => {
    after((done) => {
      Client.collection.drop();
      User.collection.drop();
      done();
    });
    it('should delete user', (done) => {
      request(app)
        .delete(`/api/users/${user._id}`)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal('test@test.cl');
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /api/users/forgotPassword', () => {
    before((done) => {
      request(app)
        .post('/api/users')
        .send(user2)
        .end((err, res) => {
          user2 = res.body;
          done();
        });
    });
    it('should report error with message - User not found, when user not exist', (done) => {
      request(app)
        .post('/api/users/forgotPassword')
        .send({ username: fakeUser })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('User not found');
          done();
        })
        .catch(done);
    });
    it('should generate a resetPasswordToken for complete the change password', (done) => {
      request(app)
        .post('/api/users/forgotPassword')
        .send({ username: user2.username })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.success).to.equal(true);
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /api/users/changePassword', () => {
    before((done) => {
      User.findOne({ username: user2.username })
        .then((u) => {
          tokenResetPassword = u.resetPasswordToken;
          done();
        })
        .catch(done);
    });
    after((done) => {
      Client.collection.drop();
      User.collection.drop();
      done();
    });
    it('should report error with message - User not found, when resetPasswordToken was not found', (done) => {
      request(app)
        .post('/api/users/changePassword')
        .send({ password: '123clave' })
        .set('resetPasswordToken', 'tokenfake')
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('User not found');
          done();
        })
        .catch(done);
    });
    it('should get a success true when change the password', (done) => {
      request(app)
        .post('/api/users/changePassword')
        .send({ password: '123clave' })
        .set('resetPasswordToken', tokenResetPassword)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.success).to.equal(true);
          done();
        })
        .catch(done);
    });
  });
});
