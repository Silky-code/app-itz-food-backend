import express from 'express';
import { jwtCheck, jwtParse } from '../middleware/auth';
import { createCheckOutSession, getOrders, stripeWebHookHandler, getRestaurantOrders, updateOrderStatus } from '../controllers/orderController';

const router = express.Router();

// Ruta para obtener órdenes del cliente
router.get('/', jwtCheck, jwtParse, getOrders);

// Ruta para obtener órdenes del restaurante
router.get('/order', jwtCheck, jwtParse, getRestaurantOrders);

// Ruta para actualizar parcialmente el estatus (PATCH)
router.patch('/:orderId/status', jwtCheck, jwtParse, updateOrderStatus);

//Ruta para procesar las peticiones del WebHook de stripe
router.post('/checkout/webhook', stripeWebHookHandler);

//ruta post para crear una sesión de stripe
router.post(
    '/checkout/create-checkout-session',
    jwtCheck,
    jwtParse,
    createCheckOutSession
);

export default router;