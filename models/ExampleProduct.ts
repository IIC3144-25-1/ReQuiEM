import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
    name: string;
    price: number;
    description: string;
    category: string;
}

const productSchema: Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    }
});

const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema)

export default Product;
