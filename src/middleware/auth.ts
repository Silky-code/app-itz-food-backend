import { type Request, type Response, type NextFunction } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
//instancias dotenv paara variables de ambiente
dotenv.config();

declare global {
    namespace Express {
        interface Request {
            userId: string,
            auth0Id: string
        }
    }
}

export const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE || '',
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || '',
    tokenSigningAlg: 'RS256'
});

export const jwtParse = async (req: Request, res: Response, next: NextFunction):Promise<any> => {
    const {authorization} = req.headers;
    
    //Los headers comenzaran con una cadena
    //Barer toke, por ejempo 
    //bearer 1234xes/fadsda
    //por lo tanto es necesario verificar que la athorizacion comience con la cadena bearer

    if(!authorization || !authorization.startsWith('Bearer')){
        console.log("jwtParse - Authorizacion denegada")
        return res.status(401).json({message: 'Authorizacion denegada'})
    }//fin del if

    //extrae el token de authorizacion separando la cadena
    const token = authorization.split(" ")[1] as string;

    try {
        const decoded = jwt.decode(token) as jwt.JwtPayload;
        const auth0Id = decoded.sub as string;
        const user = await User.findOne({auth0Id});
        if (!user) {
            console.log("jwtParse - !User find autorizacion denegada")
            return res.status(401).json({ message: "authorizacion denegada"});
        }
        req.auth0Id = auth0Id as string;
        req.userId  = user._id.toString();
        console.log("jwtParse - User found, autorizacion concedida")
        next();   

    } catch (error) {
        console.log("jswtParse - catch Autorizacion denegada")
        return res.status(401).json({ message: 'Authorizacion denegada' });
    }
}//fin de la funcion jwtParse


