import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import OrderController from "../controllers/orderController";

const router = express.Router();

// ✅ NUEVO 4.4: Obtener órdenes del cliente
router.get("/", jwtCheck, jwtParse, OrderController.getOrders);

// ✅ NUEVO 4.4: Obtener órdenes del restaurante
router.get(
  "/restaurant-orders",
  jwtCheck,
  jwtParse,
  OrderController.getRestaurantOrders
);

// ✅ NUEVO 4.4: Actualizar status de una orden (PATCH = actualización parcial)
router.patch(
  "/:orderId/status",
  jwtCheck,
  jwtParse,
  OrderController.updateOrderStatus
);

// Crear sesión de pago
router.post(
  "/checkout/create-checkout-session",
  jwtCheck,
  jwtParse,
  OrderController.createCheckOutSession
);

// Webhook de Stripe
router.post("/checkout/webhook", OrderController.stripeWebhookHandler);

export default router;