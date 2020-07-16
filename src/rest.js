const { enumerateError, getLinkHeader } = require('./utils.js');

function badRequest(input, response) {
  if (!input || input instanceof Error) {
    response.status = 400;
    if (input instanceof Error) response.body = enumerateError(input);
    return true;
  }
}

function notFound(response, empty = {}) {
  response.body = empty;
  response.status = 404;
}

function noContent(response) {
  response.status = 204;
}

function ok(result, response) {
  response.body = result;
  response.status = 200;
}

function internalServerError(error, response) {
  response.status = 500;
  response.body = enumerateError(error);
}

function unprocessableEntity(error, response) {
  response.status = 422;
  response.body = enumerateError(error);
}

function created(result, location, response) {
  response.status = 201;
  response.body = result;
  response.headers.set('Location', location);
}

function headerLinkDescribedBy(endpoint, response) {
  const links = getLinkHeader(response.headers);
  links.set('describedby', endpoint);
  response.headers.set('Link', links.toString());
}

function headerLinkPagination({ prev, next, last, first }, response) {
  const links = getLinkHeader(response.headers);
  if (prev) links.set('prev', prev);
  if (next) links.set('next', next);
  if (first) links.set('first', first);
  if (last) links.set('last', last);
  response.headers.set('Link', links.toString());
}

module.exports = {
  badRequest,
  notFound,
  ok,
  internalServerError,
  unprocessableEntity,
  headerLinkDescribedBy,
  headerLinkPagination,
  noContent,
  created,
};
