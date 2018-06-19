import Project from '../models/project';

/**
 * Load project and append to req.
 */
function load(req, res, next, id) {
  Project.get(id)
    .then((project) => {
      req.project = project; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get project
 * @returns {Project}
 */
function get(req, res) {
  return res.json(req.project);
}

/**
 * Create new project
 * @property {string} req.body.rut - The RUT of project.
 * @property {string} req.body.name - The name of project
 * @returns {Project}
 */
function create(req, res, next) {
  const project = new Project({
    title: req.body.title,
    description: req.body.description,
    comment: req.body.comment,
    responsableId: req.body.responsableId,
    companyId: req.body.companyId
  });

  project.save()
    .then(savedProject => res.json(savedProject))
    .catch(e => next(e));
}

/**
 * Update existing project
 * @property {string} req.body.id - The Id of project.
 * @property {string} req.body.secret - The Secret of project.
 * @property {string} req.body.name - The Name of project.
 * @returns {Project}
 */
function update(req, res, next) {
  const project = req.project;
  project.title = req.body.title || project.title;
  project.description = req.body.description || project.description;
  project.comment = req.body.comment || project.comment;
  project.responsableId = req.body.responsableId || project.responsableId;
  project.companyId = req.body.companyId || project.companyId;

  project.save()
    .then(savedProject => res.json(savedProject))
    .catch(e => next(e));
}

/**
 * Get project list.
 * @property {number} req.query.skip - Number of projects to be skipped.
 * @property {number} req.query.limit - Limit number of projects to be returned.
 * @returns {Project[]}
 */
function list(req, res, next) {
  const query = {};
  if (req.query.title) {
    query.title = req.query.title;
  }
  if (req.query.responsableId) {
    query.responsableId = req.query.responsableId;
  }
  if (req.query.companyId) {
    query.companyId = req.query.companyId;
  }
  Project.list(query, parseInt(req.query.skip || 0, 10), parseInt(req.query.limit || 50, 10))
    .then(projects => res.json(projects))
    .catch(e => next(e));
}

/**
 * Delete project.
 * @returns {Project}
 */
function remove(req, res, next) {
  const project = req.project;
  project.remove()
    .then(deletedProject => res.json(deletedProject))
    .catch(e => next(e));
}

export default { load, get, create, update, list, remove };
