import "dotenv/config";
import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
//import dotenv from "dotenv";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes";
import restauranteRoutes from "./routes/restauranteRoutes";
import morgan from "morgan";
import {v2 as cloudinary} from "cloudinary";

const cloudName=process.env.CLOUDINARY_CLOUD_NAME || "";
const apiKey=process.env.CLOUDINARY_API_KEY || "";
const apiSecret=process.env.CLOUDINARY_API_SECRET || "";


cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
});

//dotenv.config();

mongoose.connect(process.env.DB_CONNECTION_STRING as string)
.then (()=>{
    console.log("Base de datos conectada");
})
.catch((error)=>{
    console.log(error);
    console.log("eError al conectarse a la base de datos")

});

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/health", async(req:Request, res:Response)=>{
    res.send({message: "!Servidor Ok!"});
})

app.get("/",async(req:Request, res:Response)=>{
    res.redirect("/health");
})

app.use('/api/user', userRoutes);
app.use('/api/restaurante', restauranteRoutes);

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response)=>{
    res.send("Hola mundo");
})

app.listen(port, ()=>{
    console.log(`Servidor corriendo en el puerto`+port);
})
