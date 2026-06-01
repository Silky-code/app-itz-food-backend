import express from "express";
import multer from "multer";
import {createRestaurante, getRestaurante, updateRestaurante, searchRestaurante, getRestauranteById} from "../controllers/restauranteController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateRestauranteRequest } from "../middleware/validation";
import { param } from 'express-validator'

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1040 * 1024,
    }
});

//ruta para obtener los datos de un restaurante
router.get('/',
    jwtCheck,
    jwtParse,
    getRestaurante
)

//rutas para el restaurante 
router.post('/', 
    jwtCheck,
    jwtParse,
    upload.single("imageFile"),
    validateRestauranteRequest,
    createRestaurante
)

//ruta para actualizar un restaurante
router.put('/',
    jwtCheck,
    jwtParse,
    upload.single("imageFile"),
    validateRestauranteRequest,
    updateRestaurante
);

//ruta pra uscar los datos de un restaurante 
// ✅ Primero las rutas específicas
router.get('/search/:city',
    param("city").isString().trim().notEmpty()
        .withMessage("el parametro de la ciudad debe ser un string valido"),
    searchRestaurante
);

router.get("/:restaurantId",
    param("restaurantId").isString()
                        .trim()
                        .notEmpty()
                        .withMessage("El parametro Id del restaurante debe ser un string valido"),
    getRestauranteById
);



export default router;
