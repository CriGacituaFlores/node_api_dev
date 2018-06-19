import mongoose from 'mongoose';
import httpStatus from 'http-status';
import Story from './story';
import APIError from '../helpers/APIError';

// Overwrite mongoose promise module
mongoose.Promise = Promise;

/**
 * Task Schema
 */
const TaskSchema = new mongoose.Schema({
  title: {
    type: String
  },
  description: {
    type: String
  },
  comment: {
    type: String
  },
  startDate: {
    type: Date,
    default: new Date()
  },
  climaxDate: {
    type: Date,
    default: new Date()
  },
  endDate: {
    type: Date,
    default: new Date()
  },
  weight: {
    type: Number,
    min: 0,
    default: 0
  },
  porcentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story'
  }
}, {
  collection: 'tasks',
  autoIndex: true,
  minimize: false,
  timestamps: true
});

TaskSchema.statics = {
  get(id) {
    return this.findById(id)
      .exec()
      .then((task) => {
        if (task) {
          return task;
        }
        const err = new APIError('No such task exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  /**
   * List companies in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of companies to be skipped.
   * @param {number} limit - Limit number of companies to be returned.
   * @param {string} query - Param looking for.
   * @returns {Promise<User[]>}
   */
  list(query, skip, limit, sort) {
    return this.find(query)
      .sort(sort || { _id: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }
};

TaskSchema.post('save', (doc) => {
  if (doc.storyId) {
    Promise.all([
      Story.findOne({ _id: doc.storyId }).exec(),
      Task.find({ storyId: doc.storyId }).exec() // eslint-disable-line no-use-before-define
    ]).then((results) => {
      const story = results[0];
      const tasks = results[1];
      let totalWeight = 0;
      let totalPorcentage = 0;
      if (tasks && tasks.length) {
        tasks.forEach((task) => {
          totalWeight += task.weight;
          totalPorcentage += ((task.weight * task.porcentage) / 100);
        });
        const completion = Math.round((totalPorcentage / totalWeight) * 100);
        story.completion = completion;
        story.save();
      }
    });
  }
});

/**
 * @typedef Task
 */
const Task = mongoose.model('Task', TaskSchema);
export default Task;
