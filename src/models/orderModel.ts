import mongoose, { Schema } from "mongoose";

const orderSchema = new mongoose.Schema({
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurante', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deliveryDetails: {
        email: { type: String, required: true},
        name: { type: String, required: true},
        address: { type: String, required: true},
        city: { type: String, required: true},
        country: { type: String, required: true},
    },
    cartItems: [
        {
            menuItemId: {type: String, required: true},
            name: { type: String, required: true},
            quantity: {type: Number, required: true},
        }
    ],
    totalAmount: {type: Number},
    status: {
        type: String,
        enum: ["placed", "paid", "inProgress", "outForDelivery", "delivered"]
    },
    createdAt: {type: Date, default: Date.now}
});

export default mongoose.model('Order', orderSchema);