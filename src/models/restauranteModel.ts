import moongose from "mongoose";

const menuItemSchema = new moongose.Schema({
    name:{
        type: String,
        require: true
    },
    price:{
        type: Number,
        require: true
    }
})

const restauranteSchema = new moongose.Schema({
    user: { type: moongose.Schema.Types.ObjectId, ref: "User" },
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

export default moongose.model("Restaurante", restauranteSchema)