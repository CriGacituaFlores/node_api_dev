import AWS from 'aws-sdk';
import File from '../models/file';

AWS.config.update({
  accessKeyId: 'AKIAJN4LFNK7GIMOO5ZA',
  secretAccessKey: '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'
});

/**
 * Load file and append to req.
 */
function load(req, res, next, id) {
  File.get(id)
    .then((file) => {
      req.file = file; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get file
 * @returns {File}
 */
function get(req, res) {
  return res.json(req.file);
}

/**
 * Get file list.
 * @property {number} req.query.skip - Number of files to be skipped.
 * @property {number} req.query.limit - Limit number of files to be returned.
 * @returns {File[]}
 */
function list(req, res, next) {
  const query = {};
  if (req.query.name) {
    query.name = req.query.name;
  }
  if (req.query.type) {
    query.type = req.query.type;
  }
  if (req.query.documentId) {
    query.documentId = req.query.documentId;
  }
  File.list(query, parseInt(req.query.skip || 0, 10), parseInt(req.query.limit || 50, 10))
    .then(files => res.json(files))
    .catch(e => next(e));
}

/**
 * Delete file.
 * @returns {File}
 */
function remove(req, res, next) {
  const file = req.file;
  file.remove()
    .then(deletedFile => res.json(deletedFile))
    .catch(e => next(e));
}

function download(req, res, next) {
  try {
    const s3 = new AWS.S3();
    const options = {
      Bucket: req.file.bucket,
      Key: req.file.key
    };
    res.setHeader('Content-Type', req.file.type);
    res.attachment(req.file.key);
    const fileStream = s3.getObject(options).createReadStream();
    fileStream.pipe(res);
  } catch (e) {
    next(e);
  }
}

export default { load, get, list, remove, download };
