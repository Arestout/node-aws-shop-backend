const router = require('express').Router();

const wrapAsync = require('../../common/errors/wrapAsync');
const { makeRequest } = require('./cart.service');

router.all(
  '/*',
  wrapAsync(async (req, res) => {
    const { originalUrl, method, body } = req;

    const data = await makeRequest(originalUrl, method, body);
    res.send(data);
  })
);

module.exports = router;
