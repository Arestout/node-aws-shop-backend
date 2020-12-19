const express = require('express');
const createError = require('http-errors');
const helmet = require('helmet');
const cors = require('cors');

const cartRouter = require('./resources/cart/cart.router');
const productsRouter = require('./resources/products/products.router');

const errorHandler = require('./common/errors/errorHandler');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors());

app.get('/favicon.ico', (req, res) => {
  res.sendStatus(204);
});

app.all('/*', (req, res, next) => {
  const { originalUrl } = req;
  const recipient = originalUrl.split('/')[1];
  const recipientURL = process.env[recipient];

  if (recipientURL) {
    return next();
  }

  next(new createError.BadGateway());
});

app.use('/cart', cartRouter);
app.use('/products', productsRouter);

app.use(errorHandler);

module.exports = app;
