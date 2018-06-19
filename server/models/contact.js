import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

// Overwrite mongoose promise module
mongoose.Promise = Promise;

/**
 * Contact Schema
 */
const ContactSchema = new mongoose.Schema({
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  email: {
    type: String
  },
  address: {
    type: String
  },
  phone: {
    type: String
  },
  mobile: {
    type: String
  },
  comment: {
    type: String
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }
}, {
  collection: 'contacts',
  autoIndex: true,
  minimize: false,
  timestamps: true
});

ContactSchema.statics = {
  get(id) {
    return this.findById(id)
      .populate('companyId')
      .exec()
      .then((contact) => {
        if (contact) {
          return contact;
        }
        const err = new APIError('No such contact exists!', httpStatus.NOT_FOUND);
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
 * @typedef Contact
 */
export default mongoose.model('Contact', ContactSchema);
