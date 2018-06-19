import mongoose from 'mongoose';
//
mongoose.Promise = Promise;
/**
 * AccessToken Schema
 */
// TODO: add validations
const AccessTokenSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  clientId: {
    type: String,
    required: true
  },
  token: {
    type: String,
    unique: true,
    required: true
  }
}, {
  collection: 'accessTokens',
  timestamps: true
});
/**
 * @typedef Client
 */
export default mongoose.model('AccessToken', AccessTokenSchema);
