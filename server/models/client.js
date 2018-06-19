import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
//
mongoose.Promise = Promise;
/**
 * Client Schema
 */
const ClientSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    unique: true,
    required: true
  },
  secret: {
    type: String,
    required: true
  }
}, {
  collection: 'clients',
  timestamps: true
});
/**
 * Statics
 */
ClientSchema.statics = {
  /**
   * Get client
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get(_id) {
    return this.findById(_id)
      .exec()
      .then((client) => {
        if (client) {
          return client;
        }
        const err = new APIError('No such client exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  /**
   * List clients in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of clients to be skipped.
   * @param {number} limit - Limit number of clients to be returned.
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
 * @typedef Client
 */
export default mongoose.model('Client', ClientSchema);
