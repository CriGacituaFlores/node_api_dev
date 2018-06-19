import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
// Overwrite mongoose promise module
mongoose.Promise = Promise;

/**
 * Document Schema
 */
const DocumentSchema = new mongoose.Schema({
  name: {
    type: String
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: [
      'legal',
      'technical'
    ]
  },
  comment: {
    type: String
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  ownerType: {
    type: String,
    enum: [
      'company',
      'project',
      'story',
      'task'
    ]
  }
}, {
  collection: 'documents',
  autoIndex: true,
  minimize: false,
  timestamps: true
});

DocumentSchema.statics = {
  get(id) {
    return this.findById(id)
      .exec()
      .then((document) => {
        if (document) {
          return document;
        }
        const err = new APIError('No such document exists!', httpStatus.NOT_FOUND);
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
 * @typedef Document
 */
export default mongoose.model('Document', DocumentSchema);
