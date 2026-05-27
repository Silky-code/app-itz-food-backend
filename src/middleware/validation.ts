import {body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const handleValidationErrors = async(
    req: Request,
    res: Response,
    next: NextFunction
):Promise<any>=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    next();
}//fin de handleValidationErrors

export const validateUserRequest = [
    body("name").isString().notEmpty().withMessage("El nombre de ser string"),
    body("address").isString().notEmpty().withMessage("El address debe ser string"),
    body("city").isString().notEmpty().withMessage("La ciudad debe ser string"),
    body("country").isString().notEmpty().withMessage("El pais debe ser string"),
    handleValidationErrors
    
];//fin de validateUserRequest}

export const validateRestauranteRequest = [
    body("restauranteName").notEmpty().withMessage("El nombre del restaurante es requerido"),
    body("city").notEmpty().withMessage("La ciudad es requerida"),
    body("country").notEmpty().withMessage("El pais es requerido"),
    body("deliveryPrice").isFloat({min: 0}).withMessage("El tiempo estimado de entrega debe ser un numero positivo"),
    body("estimatedDeliveryTime").isFloat({min: 0}).withMessage("El tiempo estimado de entrega debe ser un numero positivo"),
    body("cuisines").isArray().withMessage("Los platillos deben ser un arreglo").not().isEmpty().withMessage("El arreglo de los platillos no puede estar vacio"),
    body("menuItems").isArray().withMessage("Los platillos deben ser un arreglo"),
    body("menuItems.*.name").notEmpty().withMessage("El nombre de cada platillo es requerido"),
    body("menuItems.*.price").isFloat({min: 0}).withMessage("El precio de cada platillo debe ser un numero positivo"),
    handleValidationErrors
    
];//fin de validateRestauranteRequest