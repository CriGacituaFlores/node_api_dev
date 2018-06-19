import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, {
  expect
} from 'chai';
import Accesstoken from '../models/accesstoken';
import Client from '../models/client';
import Company from '../models/company';
import Contact from '../models/contact';
import Document from '../models/document';
import File from '../models/file';
import Project from '../models/project';
import RefreshToken from '../models/refreshtoken';
import Story from '../models/story';
import Task from '../models/task';
import User from '../models/user';
import app from '../../index';

chai.config.includeStack = true;

describe('## Document APIs', () => {
  let user = {
    username: 'test@test.cl',
    password: 'asdasd',
    role: 'admin'
  };
  const authUser = {
    username: 'test@test.cl',
    password: 'asdasd',
    grant_type: 'password',
    client_id: '610568207243-ke7panhfemrs18dov7tlado9fqkad4nf.apps.googleusercontent.com',
    client_secret: 'o_90vbfKufk8rn3tqXHDpJno'
  };
  let client = {
    id: '610568207243-ke7panhfemrs18dov7tlado9fqkad4nf.apps.googleusercontent.com',
    secret: 'o_90vbfKufk8rn3tqXHDpJno',
    name: 'cliente de prueba'
  };
  let userMember = {
    username: 'member@member.cl',
    password: 'qweqwe',
    role: 'member'
  };
  let doc = {
    name: 'prueba',
    description: 'ajsdnfjhef',
    type: 'legal',
    ownerType: 'company',
    comment: 'comentariodeprueba'
  };
  let token = '';
  before((done) => {
    request(app)
      .post('/api/users')
      .send(user)
      .end((err, res) => {
        user = res.body;
        doc.ownerId = user._id;
        done();
      });
  });
  before((done) => {
    request(app)
      .post('/api/users')
      .send(userMember)
      .end((err, res) => {
        userMember = res.body;
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
  after((done) => {
    Accesstoken.collection.drop();
    Client.collection.drop();
    Company.collection.drop();
    Contact.collection.drop();
    Document.collection.drop();
    File.collection.drop();
    Project.collection.drop();
    RefreshToken.collection.drop();
    Story.collection.drop();
    Task.collection.drop();
    User.collection.drop();
    done();
  });

  describe('# POST /api/document', () => {
    it('should create a new document', (done) => {
      request(app)
        .post('/api/documents')
        .set('Authorization', token)
        .send(doc)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.name)
            .to.equal(doc.name);
          doc = res.body;
          done();
        })
        .catch(done);
    });

    it('should return error not authorized', (done) => {
      request(app)
        .post('/api/documents')
        .send(doc)
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/document', () => {
    it('showld get all documents', (done) => {
      request(app)
        .get('/api/documents')
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('showld get all documents that match query', (done) => {
      request(app)
        .get('/api/documents')
        .query(`name=${doc.name}&type=${doc.type}&ownerId=${doc.ownerId}&ownerType=${doc.ownerType}`)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('#GET /api/documents/:documentId', () => {
    it('showld get a document by Id', (done) => {
      request(app)
        .get(`/api/documents/${doc._id}`)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.name)
            .to.equal(doc.name);
          done();
        })
        .catch(done);
    });

    it('showld get Not Found when document not exists', (done) => {
      request(app)
        .get('/api/documents/56c787ccc67fc16ccc1a5e92')
        .set('Authorization', token)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message)
            .to.equal('Not Found');
          done();
        })
        .catch(done);
    });
  });

  describe('#PUT /api/documents/:documentId', () => {
    it('showld update document', (done) => {
      doc.name = 'cambiado';
      request(app)
        .put(`/api/documents/${doc._id}`)
        .send(doc)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.name)
            .to.equal(doc.name);
          done();
        })
        .catch(done);
    });
  });

  describe('#DELETE /api/documents/:documentId', () => {
    it('showld delete document', (done) => {
      request(app)
        .delete(`/api/documents/${doc._id}`)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.name)
            .to.equal(doc.name);
          done();
        })
        .catch(done);
    });
  });
});
