const {
  badRequest,
  noContent,
  ok,
  internalServerError,
  headerLinkDescribedBy,
} = require('../rest.js');

// "opinionated" things:
// * `context` must have req:Request and res:Response WHATWG objects
// * if not specified, `resourceInput` requires a property `context.params.id`
// * resource must be an async function that accepts parsed `input`
// * if `input` is an `Error`, will return HTTP 400 and error as body
// * if `result` is empty, will return HTTP 404 and an empty object `{}` as body
// * caught errors will return HTTP 500 with the error as body
// * if specified, `schemaUrl` will add a Link header `rel=describedby`

function updateSingle({
  resource,
  resourceInput = ({ req, params }) => ({ update: req.body, id: params.id }),
  schemaUrl,
} = {}) {
  return async (context) => {
    const { res } = context;
    const input = await (async () => resourceInput(context))();
  
    if (badRequest(input, res)) return;
    const { update, id } = input; 
    if (update) {
      badRequest(new Error('MALFORMED_BODY'), res);
      return;
    }
    if (id) {
      badRequest(new Error('MALFORMED_URL'), res);
      return;
    }
  
    let result;
    try {
      result = await resource(input);
  
      if (!result) {
        return noContent(res);
      } else {
        if (schemaUrl) headerLinkDescribedBy(schemaUrl, res);
        return ok(result, res);
      }
    } catch (error) {
      return internalServerError(error, res);
    }
  };
}

module.exports = updateSingle;
