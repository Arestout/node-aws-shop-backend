const axios = require('axios');
const createError = require('http-errors');
const TimersManager = require('../../common/timers');

const cache = {};

const setTimer = cacheKey => {
  const timersManager = new TimersManager();

  const timer = {
    name: cacheKey,
    job: key => {
      delete cache[key];
    }
  };

  timersManager.add(timer, cacheKey);
};

const makeRequest = async (originalUrl, method, body) => {
  const recipient = originalUrl.split('/')[1];
  const recipientURL = process.env[recipient];
  const cacheKey = originalUrl.split('/').join('');

  if (cacheKey in cache) {
    return cache[cacheKey];
  }

  try {
    const axiosConfig = {
      method,
      url: `${recipientURL}${originalUrl}`,
      ...(Object.keys(body || {}).length && { data: body })
    };

    const response = await axios(axiosConfig);

    if (method === 'GET') {
      cache[cacheKey] = response.data;
      setTimer(cacheKey, cache);
    }

    return response.data;
  } catch (err) {
    console.log(err.message);
    if (err.response) {
      const { status, data } = err.response;
      createError(status, data);
    } else {
      throw new createError.InternalServerError();
    }
  }
};

module.exports = { makeRequest };
