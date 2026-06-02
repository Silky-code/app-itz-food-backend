import Stripe from "stripe";
import { Request, Response } from "express";
import Restaurant, { MenuItemType } from "../models/restauranteModel";
import Order from "../models/orderModel";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;


type CheckoutSessionRequest = {
    cartItems: {
        menuItemId: string;
        name: string;
        quantity: string;
    }[];
    deliveryDetails: {
        email: string;
        name: string;
        address: string;
        city: string;
        country: string;
    };
    restaurantId: string;
};

export const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({ user: req.userId })
            .populate("restaurant")
            .populate("user");
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener las órdenes" });
    }
};

export const getRestaurantOrders = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ user: req.userId });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurante no encontrado" });
        }
        const orders = await Order.find({ restaurant: restaurant._id })
            .populate("restaurant")
            .populate("user");
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener las órdenes del restaurante" });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        const restaurant = await Restaurant.findById(order.restaurant);
        if (restaurant?.user?.toString() !== req.userId) {
            return res.status(401).send();
        }

        order.status = status;
        await order.save();
        res.status(200).json(order);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al actualizar el status de la orden" });
    }
};

const createLineItems = (
    checkoutSessionRequest: CheckoutSessionRequest,
    menuItems: MenuItemType[]
) => {
    return checkoutSessionRequest.cartItems.map((cartItem) => {
        const menuItem = menuItems.find(
            (item) => item._id.toString() === cartItem.menuItemId.toString()
        );
        if (!menuItem) {
            throw new Error(`Menu item no encontrado: ${cartItem.menuItemId}`);
        }
      
        return {
            price_data: {
                currency: "mxn",
                unit_amount: menuItem.price * 100,
                product_data: { name: menuItem.name },
            },
            quantity: parseInt(cartItem.quantity),
        };
    });
};

const createSession = async (
    lineItems: any,
    orderId: string,
    deliveryPrice: number,
    restaurantId: string
) => {
    return await STRIPE.checkout.sessions.create({
        line_items: lineItems,
        shipping_options: [
            {
                shipping_rate_data: {
                    display_name: "Delivery",
                    type: "fixed_amount" as const,  // ← esto
                    fixed_amount: { amount: deliveryPrice, currency: "mxn" },
                },
            },
        ],
        mode: "payment",
        metadata: { orderId, restaurantId },
        success_url: `${FRONTEND_URL}/order-status?success=true`,
        cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,
    });
};

export const createCheckOutSession = async (req: Request, res: Response) => {
    try {
        const checkoutSessionRequest: CheckoutSessionRequest = req.body;
        const restaurant = await Restaurant.findById(checkoutSessionRequest.restaurantId);
        if (!restaurant) throw new Error("Restaurante no encontrado");

        const newOrder = new Order({
            restaurant: restaurant,
            user: req.userId,
            status: "placed",
            deliveryDetails: checkoutSessionRequest.deliveryDetails,
            cartItems: checkoutSessionRequest.cartItems,
            createdAt: new Date(),
        });

        const lineItems = createLineItems(checkoutSessionRequest, restaurant.menuItems);
        const session = await createSession(
            lineItems,
            newOrder._id.toString(),
            restaurant.deliveryPrice * 100,
            restaurant._id.toString()
        );

        if (!session.url) {
            return res.status(500).json({ message: "Error al crear la sesión de Stripe" });
        }

        await newOrder.save();
        res.json({ url: session.url });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.raw?.message || error.message });
    }
};

export const stripeWebhookHandler = async (req: Request, res: Response): Promise<any> => {
    let event;
    try {
        const sig = req.headers["stripe-signature"];
        event = STRIPE.webhooks.constructEvent(req.body, sig as string, STRIPE_WEBHOOK_SECRET);
    } catch (error: any) {
        console.log(error);
        return res.status(400).json({ message: "Webhook error: " + error.message });
    }

    if (event.type === "checkout.session.completed") {
        const order = await Order.findById(event.data.object.metadata?.orderId);
        if (!order) {
            return res.status(400).json({ message: "Orden no encontrada" });
        }
        order.totalAmount = event.data.object.amount_total;
        order.status = "paid";
        await order.save();
    }

    return res.status(200).send();
};

export default {
    getOrders,
    getRestaurantOrders,
    updateOrderStatus,
    createCheckOutSession,
    stripeWebhookHandler,
};