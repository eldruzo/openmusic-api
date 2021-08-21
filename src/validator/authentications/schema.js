const Joi = require('joi');

const PostAuthenticationPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const PutAuthencationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const DeleteAuthencationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  PostAuthenticationPayloadSchema,
  PutAuthencationPayloadSchema,
  DeleteAuthencationPayloadSchema,
};
