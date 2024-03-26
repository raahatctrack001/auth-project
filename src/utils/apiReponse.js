class apiResponse{
    constructor(statusCode, message = "SUCCESS", data){
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400;
    }
}

export default apiResponse;

//revise lesson from oops for js