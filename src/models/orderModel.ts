import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
});

const deliveryDetailsSchema = new mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },   // ✅ era addressLine1
    city: { type: String, required: true },
    country: { type: String, required: true },   // ✅ faltaba
});

const orderSchema = new mongoose.Schema(
    {
        restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurante" },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        deliveryDetails: deliveryDetailsSchema,
        cartItems: [cartItemSchema],
        totalAmount: Number,
        status: {
            type: String,
            enum: ["placed", "paid", "inProgress", "outForDelivery", "delivered"],
            default: "placed",
        },
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;