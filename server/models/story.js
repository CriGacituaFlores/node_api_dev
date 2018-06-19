import mongoose from 'mongoose';
import winston from 'winston';
import httpStatus from 'http-status';
import Project from './project';
import APIError from '../helpers/APIError';

// Overwrite mongoose promise module
mongoose.Promise = Promise;

/**
 * Story Schema
 */
const StorySchema = new mongoose.Schema({
  title: {
    type: String
  },
  description: {
    type: String
  },
  completion: {
    type: Number,
    default: 0
  },
  comment: {
    type: String
  },
  startDate: {
    type: Date,
    default: new Date()
  },
  endDate: {
    type: Date,
    default: new Date()
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }
}, {
  collection: 'stories',
  autoIndex: true,
  minimize: false,
  timestamps: true
});

StorySchema.statics = {
  get(id) {
    return this.findById(id)
      .exec()
      .then((story) => {
        if (story) {
          return story;
        }
        const err = new APIError('No such story exists!', httpStatus.NOT_FOUND);
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

StorySchema.post('save', (doc) => {
  Project.findOneAndUpdate({
    $and: [
      { _id: doc.projectId },
      { stories: { $ne: doc._id } }
    ]
  }, {
    $push: {
      stories: doc._id
    }
  }, (err) => {
    if (err) {
      winston.log('error', 'Error updating project after saving story', err);
    }
  });
});

/**
 * @typedef Story
 */
export default mongoose.model('Story', StorySchema);
