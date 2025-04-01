'use server'

import dbConnect from "@/lib/dbConnect"
import Product, { IProduct } from "@/models/ExampleProduct"

export async function getProduct() {
    await dbConnect()
    try {
        const product = await Product.find().lean<IProduct>().exec()
        return product
    } catch (error) {
        console.error("Error fetching product:", error)
        throw new Error("Failed to fetch product")
    }
}