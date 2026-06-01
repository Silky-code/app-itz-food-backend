import { Request, Response } from "express";
import Stripe from 'stripe';
import Restaurante, { MenuItemType } from '../models/restauranteModel';
import Order from '../models/orderModel';

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

type CheckOutSessionRequest = {
    cartItems: {
        menuItemId: string;
        name: string;
        quantity: string
    }[];
    deliveryDetails: {
        email: string;
        name: string;
        address: string;
        city: string
    };
    restaurantId: string
};

const createLineItems = (checkOutSessionRequest: CheckOutSessionRequest, menuItems: MenuItemType[]) => {
    const lineItems = checkOutSessionRequest.cartItems.map((cartItem) => {
        const menuItem = menuItems.find(
            (item) => item._id.toString() === cartItem.menuItemId.toString()
        );
        if (!menuItem) throw new Error("Menu Item no encontrado: " + cartItem.name);
        return {
            price_data: {
                currency: "mxn",
                unit_amount: menuItem.price * 100,
                product_data: { name: menuItem.name }
            },
            quantity: parseInt(cartItem.quantity)
        };
    });
    return lineItems;
};

const createStripeSession = async (
    lineItems: any,
    orderId: string,
    deliveryPrice: number,
    restaurantId: string
) => {
    const sessionData = await STRIPE.checkout.sessions.create({
        line_items: lineItems,
        shipping_options: [{
            shipping_rate_data: {
                display_name: "Delivery",
                type: "fixed_amount",
                fixed_amount: { amount: deliveryPrice * 100, currency: "mxn" }
            }
        }],
        mode: "payment",
        metadata: { orderId, restaurantId },
        success_url: FRONTEND_URL + "/order-status?success=true",
        cancel_url: FRONTEND_URL + "/detail/" + restaurantId + "?cancelled=true"
    });
    return sessionData;
};

export const createCheckOutSession = async (req: Request, res: Response): Promise<any> => {
    try {
        const checkOutSessionRequest: CheckOutSessionRequest = req.body;
        const restaurante = await Restaurante.findById(checkOutSessionRequest.restaurantId);
        if (!restaurante) throw new Error("Restaurante no encontrado");

        const newOrder = new Order({
            restaurant: checkOutSessionRequest.restaurantId,
            user: req.userId,
            deliveryDetails: checkOutSessionRequest.deliveryDetails,
            cartItems: checkOutSessionRequest.cartItems,
            totalAmount: 0,
            status: "placed",
            createdAt: new Date(),
        });

        const lineItems = createLineItems(checkOutSessionRequest, restaurante.menuItems);
        const session = await createStripeSession(
            lineItems,
            newOrder._id.toString(),
            restaurante.deliveryPrice ?? 0,
            restaurante._id.toString()
        );

        if (!session.url)
            return res.status(500).json({ message: "Error al crear una sesión de Stripe" });

        newOrder.totalAmount = session.amount_total || 0;
        await newOrder.save();
        res.json({ url: session.url });

    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error?.raw?.message || error?.message || "Error interno del servidor" });
    }
};

export async function stripeWebHookHandler(req: Request, res: Response): Promise<any> {
    let event: any;
    try {
        const sig = req.headers["stripe-signature"];
        event = STRIPE.webhooks.constructEvent(req.body, sig as string, STRIPE_WEBHOOK_SECRET);
    } catch (error: any) {
        console.log(error);
        return res.status(400).json({ message: 'Webhook error: ' + error.message });
    }

    if (event.type === "checkout.session.completed") {
        const order = await Order.findById(event.data.object.metadata?.orderId);
        if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
        order.totalAmount = event.data.object.amount_total;
        order.status = "paid";
        await order.save();
    }

    res.status(200).send();
}

export const getOrders = async (req: Request, res: Response): Promise<any> => {
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

export const getRestaurantOrders = async (req: Request, res: Response): Promise<any> => {
    try {
        const restaurant = await Restaurante.findOne({ user: req.userId });
        if (!restaurant) return res.status(400).json({ message: 'Restaurante no encontrado' });
        const orders = await Order.find({ restaurant: restaurant._id })
            .populate("restaurant")
            .populate("user");
        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al obtener las órdenes del restaurante' });
    }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Orden no encontrada" });

        const restaurant = await Restaurante.findById(order.restaurant);
        if (!restaurant || restaurant.user?.toString() !== req.userId)
            return res.status(401).json({ message: "No tienes permiso para actualizar esta orden" });

        order.status = status;
        await order.save();
        res.status(200).json(order);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al actualizar el status de la orden" });
    }
};