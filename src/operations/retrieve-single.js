const {
  badRequest,
  notFound,
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

function retrieveSingle({
  resource,
  resourceInput = ({ params }) => params.id,
  schemaUrl,
} = {}) {
  return async (context) => {
    const { res } = context;
    const input = await (async () => resourceInput(context))();
  
    if (badRequest(input, res)) return;
  
    let result;
    try {
      result = await resource(input);
  
      if (!result) {
        return notFound(res);
      } else {
        if (schemaUrl) headerLinkDescribedBy(schemaUrl, res);
        return ok(result, res);
      }
    } catch (error) {
      return internalServerError(error, res);
    }
  };
}

module.exports = retrieveSingle;
