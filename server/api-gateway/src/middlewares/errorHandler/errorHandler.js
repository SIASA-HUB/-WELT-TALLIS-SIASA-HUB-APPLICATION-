const  Logger   =  require('../../utils/logger/logger');

const   errorHandler   =   ( err  , req ,  res  ,  next)=>{

    Logger.error(err.stack);

    res.status(err.status   ||   500).json({
        message:  err.message   ||   "internal server   error"
    })
}


module.exports   =  errorHandler;