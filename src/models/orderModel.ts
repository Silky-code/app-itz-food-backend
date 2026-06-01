import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    restaurantId: { type: String, required: true},
    userId: { type: String, required: true},
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
        enum: ["placed", "paid", "inProgress", "outForDelivevy", "delivered"]
    },
    createdAt: {type: Date, default: Date.now}
});

export default mongoose.model('Order', orderSchema);