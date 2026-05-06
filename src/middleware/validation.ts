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
    
];//fin de validateUserRequest