const asyncHandler = (requestHandler)=>{
    return (req, res, next)=>{
        Promise.resolve((requestHandler(req, res, next)))
        .catch((error)=>next(error))
    }
}
export default asyncHandler;
//to avoid server crash and picup exact error from apiErro.js, make sure to wrap function inside this promises