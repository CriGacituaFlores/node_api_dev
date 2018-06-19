import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

// Overwrite mongoose promise module
mongoose.Promise = Promise;

/**
 * Project Schema
 */
const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  comment: {
    type: String
  },
  responsableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  stories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story'
  }],
}, {
  collection: 'projects',
  autoIndex: true,
  minimize: false,
  timestamps: true
});

ProjectSchema.statics = {
  get(id) {
    return this.findById(id)
      .populate('responsableId companyId stories')
      .exec()
      .then((project) => {
        if (project) {
          return project;
        }
        const err = new APIError('No such project exists!', httpStatus.NOT_FOUND);
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
/**
 * @typedef Project
 */
export default mongoose.model('Project', ProjectSchema);
