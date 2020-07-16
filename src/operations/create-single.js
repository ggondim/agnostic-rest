const {
  badRequest,
  ok,
  internalServerError,
  unprocessableEntity,
  noContent,
} = require('../rest.js');

function createSingle({
  resource,
  resourceInput = ({ req }) => req.body,
  schemaUrl,
  createdUrl = (context, result) => `${context.req.url}/${result.id}`,
  validationError = 'VALIDATION_ERROR',
} = {}) {
  return async (context) => {
    const { res } = context;
    const input = await (async () => resourceInput(context))();
  
    if (badRequest(input, res)) return;
  
    let result;
    try {
      result = await resource(input);
  
      if (!result) {
        return noContent(res);
      } else {
        if (schemaUrl) headerLinkDescribedBy(schemaUrl, res);
        return created(result, createdUrl(context, result), res);
      }
    } catch (error) {
      if (error.message === validationError) return unprocessableEntity(error, res);
      return internalServerError(error, res);
    }
  };
}

module.exports = createSingle;
