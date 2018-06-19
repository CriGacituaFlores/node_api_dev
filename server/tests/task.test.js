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

describe('## Task APIs', () => {
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
  };
  let contact = {
    firstname: 'contactPrueba',
    lastname: 'contactApellido',
    email: 'mail@prueba.com',
    address: 'direccionprueba',
    phone: '966705339',
    mobile: 'klkslkd',
  };
  let task = {
    title: 'taskprueba',
    description: 'descriptionprueba',
    comment: 'comentarioprueba',
    startDate: new Date(),
    endDate: new Date(),
    climaxDate: new Date(),
    weight: 20,
    porcentage: 50
  };
  let token = '';
  before((done) => {
    request(app)
      .post('/api/users')
      .send(user)
      .end((err, res) => {
        user = res.body;
        project.responsableId = user._id;
        task.assigneeId = user._id;
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
        contact.companyId = company._id;
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
        task.projectId = project._id;
        done();
      });
  });
  before((done) => {
    request(app)
      .post('/api/stories')
      .set('Authorization', token)
      .send(story)
      .end((err, res) => {
        story = res.body;
        task.storyId = story._id;
        done();
      });
  });
  before((done) => {
    request(app)
      .post('/api/contacts')
      .set('Authorization', token)
      .send(contact)
      .end((err, res) => {
        contact = res.body;
        task.contactId = contact._id;
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

  describe('# POST /api/tasks', () => {
    it('should create a new task', (done) => {
      request(app)
        .post('/api/tasks')
        .set('Authorization', token)
        .send(task)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.title).to.equal(task.title);
          task = res.body;
          done();
        })
        .catch(done);
    });

    it('should return error not authorized', (done) => {
      request(app)
        .post('/api/tasks')
        .send(task)
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => {
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/tasks', () => {
    it('showld get all tasks', (done) => {
      request(app)
        .get('/api/tasks')
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('showld get all tasks that match query', (done) => {
      request(app)
        .get('/api/tasks')
        .query(`projectId=${task.projectId}&storyId=${task.storyId}&assigneeId=${task.assigneeId}&status=${task.status}`)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('#GET /api/tasks/:taskId', () => {
    it('showld get a task by Id', (done) => {
      request(app)
        .get(`/api/tasks/${task._id}`)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.title)
            .to.equal(task.title);
          done();
        })
        .catch(done);
    });

    it('showld get Not Found when story not exists', (done) => {
      request(app)
        .get('/api/tasks/56c787ccc67fc16ccc1a5e92')
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

  describe('#PUT /api/tasks/:taskId', () => {
    it('showld update tasks', (done) => {
      task.title = 'cambiado';
      request(app)
        .put(`/api/tasks/${task._id}`)
        .send(task)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.title)
            .to.equal(task.title);
          done();
        })
        .catch(done);
    });
  });

  describe('#DELETE /api/tasks/:taskId', () => {
    it('showld delete task', (done) => {
      request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', token)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.title)
            .to.equal(task.title);
          done();
        })
        .catch(done);
    });
  });
});
