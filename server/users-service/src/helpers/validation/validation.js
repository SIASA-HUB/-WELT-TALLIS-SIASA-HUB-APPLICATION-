const    joi   =  require('joi');


const    validateRegistartion   =   (data)  =>   {
    const    schema   = joi.object({
        username:    joi.string().min().max(50).required
    })


    return   schema.validate(data)

}


module.exports  =  validateRegistration