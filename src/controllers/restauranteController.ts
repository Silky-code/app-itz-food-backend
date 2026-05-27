import type {Request, Response} from "express";
import Restaurante from "../models/restauranteModel";
import Multer from "multer";
import cloudinary from "cloudinary";
import mongoose from "mongoose";


//funcion para obtener los datos de los restaurantes
export const getRestaurante = async(req: Request, res: Response)=>{
    try {
        const restaurante = await Restaurante.findOne({user: req.userId});
        if(!restaurante){
            res.status(404).json({message: "Restaurante no encontrado"});
        }
        res.json(restaurante);
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Error al obtener los datos del restaurante"});
    }
}   

export const createRestaurante = async(req: Request, res: Response) => {
    try {
        const existingRestaurante = await Restaurante.findOne({user: req.userId});
        if(existingRestaurante){
            return res.status(500).json({message: "El restaurante para este usuario ya existe"});
        }
        // creamos una url de cloudinary para la imagen del restaurante
        const imageUrl = await uploadImage(req.file as Express.Multer.File);

       
        //creamos el objeto de restaurante y lo almacenamos en la base de datos
        const restaurante = new Restaurante(req.body);
        restaurante.imageUrl = imageUrl;
        restaurante.user = new mongoose.Types.ObjectId(req.userId);
        restaurante.lastUpdated = new Date();

        await restaurante.save();
        res.status(201).send(restaurante);

        
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Error al crear el restaurante"});
    }
}

//funcion para actualizar un restaurante
export const updateRestaurante = async ( req: Request, res: Response) =>{

    try {
        let restaurante = await Restaurante.findOne({user: req.userId});
        if(!restaurante){
            res.status(404).json({message: "Restaurante no encontrado"});
        }
        //acutalizamos los datos del restaurante 
        restaurante!.restauranteName = req.body.restauranteName,
        restaurante!.city = req.body.city,
        restaurante!.country = req.body.country,
        restaurante!.deliveryPrice = req.body.deliveryPrice,
        restaurante!.estimatedDeliveryTime = req.body.estimatedDeliveryTime,
        restaurante!.cuisines = req.body.cuisines,
        restaurante!.menuItems = req.body.menuItems;
        restaurante!.lastUpdated = new Date();

        //actualizamos la imagen
        if(req.file){
            const imageUrl = await uploadImage(req.file as Express.Multer.File);
            restaurante!.imageUrl = imageUrl;
        }

        await restaurante?.save();
        res.status(200).send(restaurante);
        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error al actualizar el restaurante"});
    }
    
}// fin de updateRestaurante

//funcion auxiliar para subir la imagen
const uploadImage = async (file: Express.Multer.File)=>{
    //creamos una url de cloudinary para la imagen del restaurante 
    const image = file;

    //convertimos el objeto de la imagen a un objeto base64 para poderlo almacenar como imagen en cloudinary
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataUri = "data:" + image.mimetype + ";base64," + base64Image;

    //subimos la imagen a cloudinary
    const uploadResponse = await cloudinary.v2.uploader.upload(dataUri);

    //retornamos la url de la imagen en clourinary
    return uploadResponse.url;
}