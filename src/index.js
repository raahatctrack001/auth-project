import app from "./app.js";
import { PORT } from "./constant.js";


app.listen(PORT, ()=>{
    console.log(`server is up and running on port ${PORT}`);
})