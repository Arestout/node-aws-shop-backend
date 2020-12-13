const router = require('express').Router();

const { makeRequest } = require('./products.service');

router.all('/*', async (req, res) => {
  const { originalUrl, method, body } = req;

  const data = await makeRequest(originalUrl, method, body);
  res.send(data);
});

module.exports = router;
