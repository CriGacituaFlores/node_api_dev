import Joi from 'joi';

const userValid = {
  // POST /api/users
  createUser: {
    body: {
      username: Joi.string().required(),
      password: Joi.string().required()
    }
  },

  // PUT /api/users/:userId
  updateUser: {
    body: {
      username: Joi.string(),
      password: Joi.string()
    },
    params: {
      userId: Joi.string().hex().required()
    }
  },

  // POST /api/users/verifyEmail
  verifyUser: {
    body: {
      pin: Joi.string().hex().required()
    }
  }
};

const clientValid = {
  // POST /api/users
  createClient: {
    body: {
      id: Joi.string().required(),
      secret: Joi.string().required(),
      name: Joi.string().required()
    }
  },

  // PUT /api/users/:userId
  updateClient: {
    body: {
      id: Joi.string().required(),
      secret: Joi.string().required(),
      name: Joi.string().required()
    },
    params: {
      clientId: Joi.string().hex().required()
    }
  }
};

export { userValid, clientValid };
