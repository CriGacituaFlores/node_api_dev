import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

// Overwrite mongoose promise module
mongoose.Promise = Promise;

/**
 * File Schema
 */
const FileSchema = new mongoose.Schema({
  name: {
    type: String
  },
  path: {
    type: String
  },
  size: {
    type: Number
  },
  type: {
    type: String
  },
  location: {
    type: String
  },
  bucket: {
    type: String
  },
  key: {
    type: String,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'User'
  }
}, {
  collection: 'files',
  autoIndex: true,
  minimize: false,
  timestamps: true
});

FileSchema.statics = {
  get(id) {
    return this.findById(id)
      .exec()
      .then((file) => {
        if (file) {
          return file;
        }
        const err = new APIError('No such file exists!', httpStatus.NOT_FOUND);
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
 * @typedef File
 */
export default mongoose.model('File', FileSchema);
