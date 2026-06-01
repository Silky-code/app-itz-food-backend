import  mongoose, { InferSchemaType } from "mongoose";


const menuItemSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        default: () => new mongoose.Types.ObjectId()
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
})

export type MenuItemType = InferSchemaType<typeof menuItemSchema>;

const restauranteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restauranteName: { type: String, require: true },
    city: {type: String, require: true},
    country:{type: String, require: true},
    deliveryPrice: {type: Number, require:true},
    estimatedDeliveryTime: {type: Number, require: true},
    cuisines: [{type: String, require:true}],
    menuItems: [menuItemSchema],
    imageUrl: {type: String, require: true},
    lastUpdated: {type: Date, require:true},
    
})

export default mongoose.model("Restaurante", restauranteSchema)