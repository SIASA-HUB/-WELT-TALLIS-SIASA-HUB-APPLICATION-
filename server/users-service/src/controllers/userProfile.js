const    Logger  =  require('../utils/logger/logger');
const   {   safeQuery  ,   safeQueryOne }   =  require('../configurations/db');
const  asyncHandler  =  require('express-async-handler');


const   getUserProfile   =    asyncHandler(async  (  req  , res)=>{

    try {

        const   {  id }  =  req.params;
        

    
        
    } catch (error) {
        Logger.error(`Error  occurred   while   fetching user   profile`,  {
            error:  error,
            stack:   error.stack
        })
    }

})


module.exports   =    getUserProfile;
