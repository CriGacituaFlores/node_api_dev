import mongoose from 'mongoose';
import Task from '../models/task';

mongoose.Promise = Promise;
// For dev purposes only

/**
 * Load task and append to req.
 */
function load(req, res, next, id) {
  Task.get(id)
    .then((task) => {
      req.task = task; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get task
 * @returns {Task}
 */
function get(req, res) {
  return res.json(req.task);
}

/**
 * Create new task
 * @property {string} req.body.rut - The RUT of task.
 * @property {string} req.body.name - The name of task
 * @returns {Task}
 */
function create(req, res, next) {
  const task = new Task({
    title: req.body.title,
    description: req.body.description,
    comment: req.body.comment,
    startDate: req.body.startDate,
    climaxDate: req.body.climaxDate,
    endDate: req.body.endDate,
    weight: req.body.weight,
    porcentage: req.body.porcentage,
    assigneeId: req.body.assigneeId,
    contactId: req.body.contactId,
    projectId: req.body.projectId,
    storyId: req.body.storyId
  });

  task.save()
    .then(savedTask => res.json(savedTask))
    .catch(e => next(e));
}

/**
 * Update existing task
 * @property {string} req.body.id - The Id of task.
 * @property {string} req.body.secret - The Secret of task.
 * @property {string} req.body.name - The Name of task.
 * @returns {Task}
 */
function update(req, res, next) {
  const task = req.task;
  task.title = req.body.title || task.title;
  task.description = req.body.description || task.description;
  task.comment = req.body.comment || task.comment;
  task.startDate = req.body.startDate || task.startDate;
  task.climaxDate = req.body.climaxDate || task.climaxDate;
  task.endDate = req.body.endDate || task.endDate;
  task.weight = req.body.weight || task.weight;
  task.porcentage = req.body.porcentage || task.porcentage;
  task.assigneeId = req.body.assigneeId || task.assigneeId;
  task.contactId = req.body.contactId || task.contactId;
  task.projectId = req.body.projectId || task.projectId;
  task.storyId = req.body.storyId || task.storyId;

  task.save()
    .then(savedTask => res.json(savedTask))
    .catch(e => next(e));
}

/**
 * Get task list.
 * @property {number} req.query.skip - Number of tasks to be skipped.
 * @property {number} req.query.limit - Limit number of tasks to be returned.
 * @returns {Task[]}
 */
function list(req, res, next) {
  const query = {};
  if (req.query.projectId) {
    query.projectId = req.query.projectId;
  }
  if (req.query.storyId) {
    query.storyId = req.query.storyId;
  }
  if (req.query.assigneeId) {
    query.assigneeId = req.query.assigneeId;
  }
  if (req.query.status) {
    query.status = req.query.status;
  }
  Task.list(query, parseInt(req.query.skip || 0, 10), parseInt(req.query.limit || 50, 10))
    .then(tasks => res.json(tasks))
    .catch(e => next(e));
}

/**
 * Delete task.
 * @returns {Task}
 */
function remove(req, res, next) {
  const task = req.task;
  task.remove()
    .then(deletedTask => res.json(deletedTask))
    .catch(e => next(e));
}

export default { load, get, create, update, list, remove };
