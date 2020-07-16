const LinkHeader = require('http-link-header');

function enumerateError(error) {
  return {
    ...error,
    name: error.name,
    message: error.message,
  };
}

function getLinkHeader(response) {
  const links = new LinkHeader();
  if (response.headers.has('Link')) {
    links.parse(response.headers.get('Link'));
  }
  return links;
}

module.exports = {
  enumerateError,
};
