import mongoose from 'mongoose';
import Contact from '../models/contact';

mongoose.Promise = Promise;
// For dev purposes only

/**
 * Load contact and append to req.
 */
function load(req, res, next, id) {
  Contact.get(id)
    .then((contact) => {
      req.contact = contact; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get contact
 * @returns {Contact}
 */
function get(req, res) {
  return res.json(req.contact);
}

/**
 * Create new contact
 * @property {string} req.body.rut - The RUT of contact.
 * @property {string} req.body.name - The name of contact
 * @returns {Contact}
 */
function create(req, res, next) {
  const contact = new Contact({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    address: req.body.address,
    phone: req.body.phone,
    mobile: req.body.mobile,
    comment: req.body.comment,
    companyId: req.body.companyId
  });

  contact.save()
    .then(savedContact => res.json(savedContact))
    .catch(e => next(e));
}

/**
 * Update existing contact
 * @property {string} req.body.id - The Id of contact.
 * @property {string} req.body.secret - The Secret of contact.
 * @property {string} req.body.name - The Name of contact.
 * @returns {Contact}
 */
function update(req, res, next) {
  const contact = req.contact;
  contact.firstname = req.body.firstname || contact.firstname;
  contact.lastname = req.body.lastname || contact.lastname;
  contact.email = req.body.email || contact.email;
  contact.address = req.body.address || contact.address;
  contact.phone = req.body.phone || contact.phone;
  contact.mobile = req.body.mobile || contact.mobile;
  contact.comment = req.body.comment || contact.comment;
  contact.companyId = req.body.companyId || contact.companyId;

  contact.save()
    .then(savedContact => res.json(savedContact))
    .catch(e => next(e));
}

/**
 * Get contact list.
 * @property {number} req.query.skip - Number of contacts to be skipped.
 * @property {number} req.query.limit - Limit number of contacts to be returned.
 * @returns {Contact[]}
 */
function list(req, res, next) {
  const query = {};
  if (req.query.companyId) {
    query.companyId = req.query.companyId;
  }
  Contact.list(query, parseInt(req.query.skip || 0, 10), parseInt(req.query.limit || 50, 10))
    .then(contacts => res.json(contacts))
    .catch(e => next(e));
}

/**
 * Delete contact.
 * @returns {Contact}
 */
function remove(req, res, next) {
  const contact = req.contact;
  contact.remove()
    .then(deletedContact => res.json(deletedContact))
    .catch(e => next(e));
}

export default { load, get, create, update, list, remove };
