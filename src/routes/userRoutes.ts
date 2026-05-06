import express from 'express';
import { createUser, updateUser, getUser } from '../controllers/userController';
import { jwtCheck, jwtParse } from '../middleware/auth';
import { validateUserRequest } from '../middleware/validation';

const router = express.Router();

router.post("/", jwtCheck, createUser);

// ruta para actualizar un usuario 
router.put("/", jwtCheck, jwtParse,validateUserRequest, updateUser);

//ruta para obtener el usuario actual
router.get("/", jwtCheck, jwtParse, getUser);

export default router;