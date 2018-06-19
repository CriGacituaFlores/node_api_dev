import mongoose from 'mongoose';
import Story from '../models/story';

mongoose.Promise = Promise;
// For dev purposes only

/**
 * Load story and append to req.
 */
function load(req, res, next, id) {
  Story.get(id)
    .then((story) => {
      req.story = story; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get story
 * @returns {Story}
 */
function get(req, res) {
  return res.json(req.story);
}

/**
 * Create new story
 * @property {string} req.body.rut - The RUT of story.
 * @property {string} req.body.name - The name of story
 * @returns {Story}
 */
function create(req, res, next) {
  const story = new Story({
    title: req.body.title,
    description: req.body.description,
    comment: req.body.comment,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    projectId: req.body.projectId,
    completion: 0
  });

  story.save()
    .then(savedStory => res.json(savedStory))
    .catch(e => next(e));
}

/**
 * Update existing story
 * @property {string} req.body.id - The Id of story.
 * @property {string} req.body.secret - The Secret of story.
 * @property {string} req.body.name - The Name of story.
 * @returns {Story}
 */
function update(req, res, next) {
  const story = req.story;
  story.title = req.body.title || story.title;
  story.description = req.body.description || story.description;
  story.comment = req.body.comment || story.comment;
  story.startDate = req.body.startDate || story.startDate;
  story.climaxDate = req.body.climaxDate || story.climaxDate;
  story.endDate = req.body.endDate || story.endDate;
  story.projectId = req.body.projectId || story.projectId;
  story.completion = req.body.completion || story.completion;
  story.save()
    .then(savedStory => res.json(savedStory))
    .catch(e => next(e));
}

/**
 * Get story list.
 * @property {number} req.query.skip - Number of stories to be skipped.
 * @property {number} req.query.limit - Limit number of stories to be returned.
 * @returns {Story[]}
 */
function list(req, res, next) {
  const query = {};
  if (req.query.projectId) {
    query.projectId = req.query.projectId;
  }
  Story.list(query, parseInt(req.query.skip || 0, 10), parseInt(req.query.limit || 50, 10))
    .then(stories => res.json(stories))
    .catch(e => next(e));
}

/**
 * Delete story.
 * @returns {Story}
 */
function remove(req, res, next) {
  const story = req.story;
  story.remove()
    .then(deletedStory => res.json(deletedStory))
    .catch(e => next(e));
}

export default { load, get, create, update, list, remove };
