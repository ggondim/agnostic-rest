const {
  badRequest,
  notFound,
  ok,
  internalServerError,
  headerLinkDescribedBy,
  headerLinkPagination,
} = require('../rest.js');

// * if not specified, `resource input` requires that `context.req.url` is instanceOf WHATWG URL class
// * if not specified, `resource input` only will return request searchParams as an object
// * resource must be an async function that accepts parsed `input`
// * if `input` is an `Error`, will return HTTP 400 and error as body
// * if `result` is empty, will return HTTP 404 and an empty object `[]` as body
// * caught errors will return HTTP 500 with the error as body
// * if specified, `schemaUrl` will add a Link header `rel=describedby`

function retrieveMultiple({
  resource,
  paginate,
  resourceInput = ({ req }) => Object.fromEntries(req.url.searchParams.entries()),
  paginateInput = () => {},
  schemaUrl,
} = {}) {
  return async (context) => {
    const { res } = context;

    const input = await (async () => resourceInput(context))();
    if (badRequest(input, res)) return;

    let pagInput;
    if (paginate) {
      pagInput = await (async () => paginateInput(context))();
      if (badRequest(pagInput, res)) return;
    }
  
    let result, paginateResult;
    try {
      if (paginate) {
        paginateResult = await paginate(pagInput);
        // non-obstrusive pagination, TODO: warning when result is empty
        if (paginateResult) headerLinkPagination(paginateResult, res);
      }

      result = await resource(input);
  
      if (!result) {
        return notFound(res, []);
      } else {
        if (schemaUrl) headerLinkDescribedBy(schemaUrl, res);
        return ok(result, res);
      }
    } catch (error) {
      return internalServerError(error, res);
    }
  };
}

module.exports = retrieveMultiple;