import mongoose from 'mongoose';
//
mongoose.Promise = Promise;
/**
 * AccessToken Schema
 */
// ODO: add validations
// TODO: add updatedAt
const RefreshTokenSchema = new mongoose.Schema({
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
  collection: 'refreshTokens',
  timestamps: true
});
/**
 * @typedef RefreshToken
 */
export default mongoose.model('RefreshToken', RefreshTokenSchema);
