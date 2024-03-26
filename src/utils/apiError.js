class apiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        error = [],
        stack = ""
        ){
            super(message);
            this.statusCode = statusCode;
            this.message = message;
            this.error = error;
            this.data = null;
            if(stack){
                this.stack = stack;
            }
            else{
                Error.captureStackTrace(this, this.constructor);
                /*captureStackTrace returns a string that represents the location of that particular error in the call. 
                It gives us a stack that helps us to find the location of that error in the code at which new Error() was Called. 
                this will help us to find the exact error in our code.*/
            }
        }
}

export default apiError;