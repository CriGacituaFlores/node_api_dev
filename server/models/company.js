import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

// Overwrite mongoose promise module
mongoose.Promise = Promise;

/**
 * Company Schema
 */
const CompanySchema = new mongoose.Schema({
  name: {
    type: String
  },
  rut: {
    type: String
  },
  comment: {
    type: String
  }
}, {
  collection: 'companies',
  autoIndex: true,
  minimize: false,
  timestamps: true
});

CompanySchema.statics = {
  get(id) {
    return this.findById(id)
      .exec()
      .then((company) => {
        if (company) {
          return company;
        }
        const err = new APIError('No such company exists!', httpStatus.NOT_FOUND);
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
 * @typedef Company
 */
export default mongoose.model('Company', CompanySchema);
