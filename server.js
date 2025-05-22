import express from "express";

import dotenv from "dotenv";
import authRoute from "./routes/authRoute.js";
import taskRoute from "./routes/taskRoute.js";


const app= express();
dotenv.config();

app.use(express.json());

app.use("/auth", authRoute);
app.use("/task", taskRoute);


app.listen(7000,()=>{
    console.log(`Server listening at port:7000`);
    
})