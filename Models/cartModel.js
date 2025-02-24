
// import mongoose from 'mongoose';

// const cartSchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//         ref: 'User'
//     },
//     items: [{
//         category: {
//             type: String,
//             required: true
//         },
//         productId: {
//             type: mongoose.Schema.Types.ObjectId,
//             required: true,
//             ref: 'Service' 
//         },
//         addons: [{
//             type: mongoose.Schema.Types.ObjectId, 
//         }],
//         prevAddons: [{
//             type: mongoose.Schema.Types.ObjectId, 
//         }],
//         subscription: { 
//             type: Boolean,
//             default: false 
//         }
//     }]
// }, { timestamps: true });



// const Cart = mongoose.model('Cart', cartSchema);
// export default Cart;