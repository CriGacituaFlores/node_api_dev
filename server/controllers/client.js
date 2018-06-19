import Client from '../models/client';

/**
 * Load client and append to req.
 */
function load(req, res, next, id) {
  Client.get(id)
    .then((client) => {
      req.client = client; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get client
 * @returns {Client}
 */
function get(req, res) {
  return res.json(req.client);
}

/**
 * Create new client
 * @property {string} req.body.id - The Id of client.
 * @property {string} req.body.secret - The Secret of client.
 * @property {string} req.body.name - The Name of client.
 * @returns {Client}
 */
function create(req, res, next) {
  const client = new Client({
    id: req.body.id,
    secret: req.body.secret,
    name: req.body.name
  });

  client.save()
    .then(savedClient => res.json(savedClient))
    .catch(e => next(e));
}

/**
 * Update existing client
 * @property {string} req.body.id - The Id of client.
 * @property {string} req.body.secret - The Secret of client.
 * @property {string} req.body.name - The Name of client.
 * @returns {Client}
 */
function update(req, res, next) {
  const client = req.client;
  client.id = req.body.id;
  client.secret = req.body.secret;
  client.name = req.body.name;

  client.save()
    .then(savedClient => res.json(savedClient))
    .catch(e => next(e));
}

/**
 * Get client list.
 * @property {number} req.query.skip - Number of clients to be skipped.
 * @property {number} req.query.limit - Limit number of clients to be returned.
 * @returns {Client[]}
 */
function list(req, res, next) {
  const query = {};
  if (req.query.name) {
    query.name = req.query.name;
  }
  Client.list(query, parseInt(req.query.skip || 0, 10), parseInt(req.query.limit || 50, 10))
    .then(clients => res.json(clients))
    .catch(e => next(e));
}

/**
 * Delete client.
 * @returns {Client}
 */
function remove(req, res, next) {
  const client = req.client;
  client.remove()
    .then(deletedClient => res.json(deletedClient))
    .catch(e => next(e));
}

export default { load, get, create, update, list, remove };
