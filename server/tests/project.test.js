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

describe('## project APIs', () => {
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
  let company = {
    name: 'companyPruebas',
    rut: 'ajsdnfjhef'
  };
  let project = {
    title: 'titleprueba',
    description: 'descriptionprueba',
    comment: 'comantarioprueba'
  };
  let token = '';
  before((done) => {
    request(app)
      .post('/api/users')
      .send(user)
      .end((err, res) => {
        user = res.body;
        project.responsableId = user._id;
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
      .post('/api/companies')
      .set('Authorization', token)
      .send(company)
      .end((err, res) => {
        company = res.body;
        project.companyId = company._id;
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

  describe('# POST /api/projects', () => {
    it('should create a new project', (done) => {
      request(app)
        .post('/api/projects')
        .set('Authorization', token)
        .send(project)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.title)
            .to.equal(project.title);
          project = res.body;
          done();
        })
        .catch(done);
    });

    it('should return error not authorized', (done) => {
      request(app)
        .post('/api/projects')
        .send(project)
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/projects', () => {
    it('showld get all projects', (done) => {
      request(app)
        .get('/api/projects')
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('showld get all projects that match query', (done) => {
      request(app)
        .get('/api/projects')
        .query(`title=${project.title}&responsableId=${project.responsableId}&companyId=${project.companyId}`)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('#GET /api/projects/:projectId', () => {
    it('showld get a project by Id', (done) => {
      request(app)
        .get(`/api/projects/${project._id}`)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.title)
            .to.equal(project.title);
          done();
        })
        .catch(done);
    });

    it('showld get Not Found when document not exists', (done) => {
      request(app)
        .get('/api/projects/56c787ccc67fc16ccc1a5e92')
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

  describe('#PUT /api/projects/:projectId', () => {
    it('showld update project', (done) => {
      project.title = 'cambiado';
      request(app)
        .put(`/api/projects/${project._id}`)
        .send(project)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.title)
            .to.equal(project.title);
          done();
        })
        .catch(done);
    });
  });

  describe('#DELETE /api/projects/:projectId', () => {
    it('showld delete project', (done) => {
      request(app)
        .delete(`/api/projects/${project._id}`)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.title)
            .to.equal(project.title);
          done();
        })
        .catch(done);
    });
  });
});
