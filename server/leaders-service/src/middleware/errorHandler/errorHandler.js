const  Logger  = require('../../utilities/logger/logger');

const errorHandler = (err, req, res, next) => {

  Logger.error(err.stack || err.message);


  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
};

module.exports = { errorHandler };
