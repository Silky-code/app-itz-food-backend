import express from 'express';
import { jwtCheck, jwtParse } from '../middleware/auth';
import { createCheckOutSession, stripeWebHookHandler } from '../controllers/orderController';

//Ruta para procesar las peticiones del WebHook de stripe


const router = express.Router();

router.post('/checkout/webhook', stripeWebHookHandler);

//ruta post para crear una sesión de stripe
router.post(
    '/checkout/create-checkout-session',
    jwtCheck,
    jwtParse,
    createCheckOutSession
);

export default router;