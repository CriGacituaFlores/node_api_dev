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

describe('## Story APIs', () => {
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
    title: 'titleprueb',
    description: 'descriptionprueba',
  };
  let story = {
    title: 'storyprueba',
    description: 'descriptionprueba',
    comment: 'comentariodeprueba'
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
  before((done) => {
    request(app)
      .post('/api/projects')
      .set('Authorization', token)
      .send(project)
      .end((err, res) => {
        project = res.body;
        story.projectId = project._id;
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

  describe('# POST /api/stories', () => {
    it('should create a new story', (done) => {
      request(app)
        .post('/api/stories')
        .set('Authorization', token)
        .send(story)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.title)
            .to.equal(story.title);
          story = res.body;
          done();
        })
        .catch(done);
    });

    it('should return error not authorized', (done) => {
      request(app)
        .post('/api/stories')
        .send(story)
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/stories', () => {
    it('showld get all stories', (done) => {
      request(app)
        .get('/api/stories')
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('showld get all companies that match query', (done) => {
      request(app)
        .get('/api/companies')
        .query(`projectId=${story.projectId}`)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('#GET /api/stories/:storyId', () => {
    it('showld get a story by Id', (done) => {
      request(app)
        .get(`/api/stories/${story._id}`)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.title)
            .to.equal(story.title);
          done();
        })
        .catch(done);
    });

    it('showld get Not Found when story not exists', (done) => {
      request(app)
        .get('/api/stories/56c787ccc67fc16ccc1a5e92')
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

  describe('#PUT /api/stories/:storyId', () => {
    it('showld update story', (done) => {
      story.title = 'cambiado';
      request(app)
        .put(`/api/stories/${story._id}`)
        .send(story)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.title)
            .to.equal(story.title);
          done();
        })
        .catch(done);
    });
  });

  describe('#DELETE /api/stories/:storyId', () => {
    it('showld delete story', (done) => {
      request(app)
        .delete(`/api/stories/${story._id}`)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.title)
            .to.equal(story.title);
          done();
        })
        .catch(done);
    });
  });
});
