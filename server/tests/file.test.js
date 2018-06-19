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

describe('## File APIs', () => {
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
    name: 'documentoPrueba',
    descripcion: 'ajsdnfjhef',
    type: 'legal',
    ownerType: 'company'
  };
  const file = {
    name: 'fileprueba',
    path: 'pathprueba',
    size: 'sizeprueba',
    type: 'typeprueba',
    location: 'locationprueba',
    bucket: 'bucketprueba',
    key: 'keyprueba',
  };
  let token = '';
  before((done) => {
    request(app)
      .post('/api/users')
      .send(user)
      .end((err, res) => {
        user = res.body;
        file.uploaderId = user._id;
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
  before((done) => {
    request(app)
      .post('/api/documents')
      .set('Authorization', token)
      .send(doc)
      .end((err, res) => {
        doc = res.body;
        file.documentId = doc._id;
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

  describe('# GET /api/files', () => {
    it('showld get all files', (done) => {
      request(app)
        .get('/api/files')
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('showld get all files that match query', (done) => {
      request(app)
        .get('/api/files')
        .query(`name=${file.name}&type=${file.type}&documentId=${file.documentId}`)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });
});
