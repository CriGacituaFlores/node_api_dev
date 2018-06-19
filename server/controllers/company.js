import Company from '../models/company';

/**
 * Load company and append to req.
 */
function load(req, res, next, id) {
  Company.get(id)
    .then((company) => {
      req.company = company; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get company
 * @returns {Company}
 */
function get(req, res) {
  return res.json(req.company);
}

/**
 * Create new company
 * @property {string} req.body.rut - The RUT of company.
 * @property {string} req.body.name - The name of company
 * @returns {Company}
 */
function create(req, res, next) {
  const company = new Company({
    name: req.body.name,
    rut: req.body.rut,
    comment: req.body.comment
  });

  company.save()
    .then(savedCompany => res.json(savedCompany))
    .catch(e => next(e));
}

/**
 * Update existing company
 * @property {string} req.body.id - The Id of company.
 * @property {string} req.body.secret - The Secret of company.
 * @property {string} req.body.name - The Name of company.
 * @returns {Company}
 */
function update(req, res, next) {
  const company = req.company;
  company.rut = req.body.rut || company.rut;
  company.name = req.body.name || company.name;
  company.comment = req.body.comment || company.comment;

  company.save()
    .then(savedCompany => res.json(savedCompany))
    .catch(e => next(e));
}

/**
 * Get company list.
 * @property {number} req.query.skip - Number of companys to be skipped.
 * @property {number} req.query.limit - Limit number of companys to be returned.
 * @returns {Company[]}
 */
function list(req, res, next) {
  const query = {};
  if (req.query.name) {
    query.name = req.query.name;
  }
  if (req.query.rut) {
    query.rut = req.query.rut;
  }
  Company.list(query, parseInt(req.query.skip || 0, 10), parseInt(req.query.limit || 50, 10))
    .then(companies => res.json(companies))
    .catch(e => next(e));
}

/**
 * Delete company.
 * @returns {Company}
 */
function remove(req, res, next) {
  const company = req.company;
  company.remove()
    .then(deletedCompany => res.json(deletedCompany))
    .catch(e => next(e));
}

export default { load, get, create, update, list, remove };
