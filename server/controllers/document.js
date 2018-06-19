import fs from 'fs';
import AWS from 'aws-sdk';
import mongoose from 'mongoose';
import randomstring from 'randomstring';
import Document from '../models/document';
import File from '../models/file';

mongoose.Promise = Promise;
// For dev purposes only
AWS.config.update({
  accessKeyId: 'AKIAJN4LFNK7GIMOO5ZA',
  secretAccessKey: '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'
});

/**
 * Load document and append to req.
 */
function load(req, res, next, id) {
  Document.get(id)
    .then((document) => {
      req.document = document; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get document
 * @returns {Document}
 */
function get(req, res) {
  return res.json(req.document);
}

/**
 * Create new document
 * @property {string} req.body.rut - The RUT of document.
 * @property {string} req.body.name - The name of document
 * @returns {Document}
 */
function create(req, res, next) {
  const document = new Document({
    name: req.body.name,
    description: req.body.description,
    type: req.body.type,
    comment: req.body.comment,
    ownerId: req.body.ownerId,
    ownerType: req.body.ownerType
  });

  document.save()
    .then(savedDocument => res.json(savedDocument))
    .catch(e => next(e));
}

/**
 * Update existing document
 * @property {string} req.body.id - The Id of document.
 * @property {string} req.body.secret - The Secret of document.
 * @property {string} req.body.name - The Name of document.
 * @returns {Document}
 */
function update(req, res, next) {
  const document = req.document;
  document.name = req.body.name || document.name;
  document.description = req.body.description || document.description;
  document.type = req.body.type || document.type;
  document.comment = req.body.comment || document.comment;
  document.ownerId = req.body.ownerId || document.ownerId;
  document.ownerType = req.body.ownerType || document.ownerType;

  document.save()
    .then(savedDocument => res.json(savedDocument))
    .catch(e => next(e));
}

/**
 * Get document list.
 * @property {number} req.query.skip - Number of documents to be skipped.
 * @property {number} req.query.limit - Limit number of documents to be returned.
 * @returns {Document[]}
 */
function list(req, res, next) {
  const query = {};
  if (req.query.name) {
    query.name = req.query.name;
  }
  if (req.query.type) {
    query.type = req.query.type;
  }
  if (req.query.ownerId) {
    query.ownerId = req.query.ownerId;
  }
  if (req.query.ownerType) {
    query.ownerType = req.query.ownerType;
  }
  Document.list(query, parseInt(req.query.skip || 0, 10), parseInt(req.query.limit || 50, 10))
    .then(documents => res.json(documents))
    .catch(e => next(e));
}

/**
 * Delete document.
 * @returns {Document}
 */
function remove(req, res, next) {
  const document = req.document;
  document.remove()
    .then(deletedDocument => res.json(deletedDocument))
    .catch(e => next(e));
}

function upload(req, res, next) {
  let base64Data = null;
  let ext = null;
  if (req.body.data.indexOf('jpg;base64') !== -1) {
    ext = 'jpg';
    base64Data = req.body.data.replace(/^data:image\/jpg;base64,/, '');
  } else if (req.body.data.indexOf('jpeg;base64') !== -1) {
    ext = 'jpg';
    base64Data = req.body.data.replace(/^data:image\/jpeg;base64,/, '');
  } else if (req.body.data.indexOf('pdf;base64') !== -1) {
    ext = 'pdf';
    base64Data = req.body.data.replace(/^data:application\/pdf;base64,/, '');
  }
  if (base64Data && ext) {
    const s3 = new AWS.S3();
    const key = `${new mongoose.mongo.ObjectId()}_${randomstring.generate(10)}.${ext}`;
    const filePath = `${__dirname}/${new mongoose.mongo.ObjectId()}_${randomstring.generate(10)}.${ext}`;
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
      if (err) {
        next(err);
      } else {
        const fileStream = fs.createReadStream(filePath);
        s3.upload({
          Bucket: 'agrobolt',
          Key: key,
          Body: fileStream,
          ACL: 'public-read'
        }, (errS3, resS3) => {
          if (errS3) {
            next(errS3);
          } else {
            const file = new File({
              name: req.body.name,
              path: filePath,
              size: req.body.size,
              type: req.body.type,
              location: resS3.Location,
              bucket: resS3.Bucket,
              key: resS3.Key,
              documentId: req.document._id,
              uploaderId: req.user._id
            });
            file.save()
              .then((savedFile) => {
                fs.unlink(filePath, (errFs) => {
                  if (errFs) {
                    next(errFs);
                  } else {
                    res.json(savedFile);
                  }
                });
              })
              .catch(e => next(e));
          }
        });
      }
    });
  } else {
    next(new Error('Unsupported file type'));
  }
}

export default { load, get, create, update, list, remove, upload };
