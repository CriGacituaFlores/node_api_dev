import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

mongoose.Promise = Promise;
/**
 * User Schema
 */
// TODO: add username
// TODO: add mongoose validations
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    firstName: {
      type: String
    },
    lastName: {
      type: String
    }
  },
  role: {
    type: String,
    enum: ['guest', 'member', 'admin'],
    default: 'member'
  },
  email_verification_pin: String,
  email_verification_attempts: {
    type: Number,
    default: 0
  },
  last_email_verification_attempt: Number,
  resetPasswordToken: String,
  resetPasswordExpires: Number
}, {
  collection: 'users',
  timestamps: true
});
/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
// Pre-save of user to database, hash password if password is modified or new
// se usa function para conservar el this, sino da error ES6
UserSchema.pre('save', function (next) { // eslint-disable-line func-names
  const user = this;
  const SALT_FACTOR = 5;
  if (!user.isModified('password')) return next();
  return bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, null, (error, hash) => {
      if (error) return next(error);
      user.password = hash;
      return next();
    });
    return false;
  });
});
/**
 * Methods
 */
UserSchema.method({
  comparePassword(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) {
        return cb(err);
      }
      return cb(null, isMatch);
    });
  }
});
/**
 * Statics
 */
UserSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },
  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @param {string} query - Param looking for.
   * @returns {Promise<User[]>}
   */
  list(query, skip, limit, sort) {
    return this.find(query)
      .sort(sort || { _id: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },
  /**
   * Get Token of logged user from headers
   * @param headers
   * @return {Array|*}
   */
  getUserToken(headers) {
    const str = headers.authorization;
    return str.split(' ');
  }
};

/**
 * @typedef User
 */
export default mongoose.model('User', UserSchema);
