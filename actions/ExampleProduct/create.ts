'use server'

import dbConnect from "@/lib/dbConnect"
import Product, { IProduct } from "@/models/ExampleProduct"


export async function createProduct(data: IProduct) {
    await dbConnect()
    try {
        const savedProduct = await Product.create(data)
        return savedProduct
    } catch (error) {
        console.error("Error saving product:", error)
        throw new Error("Failed to save product")
    }
}