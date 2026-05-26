export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import OrderItem from "@/lib/models/OrderItem";
import Customer from "@/lib/models/Customer";
import User from "@/lib/models/User";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import ProductVariant from "@/lib/models/ProductVariant";

//Get The Orders Data
export async function GET() {
    try {
        await connectDB();

        const orders = await Order.find().sort({ created_at: -1 });
        console.log("Backend API To Get Users, Categories, Products Images, Products, Order Items, Orders & Customers.");

        //Order Grouping
        const recentOrders = [];

        for (const o of orders) {
            const customer = o.customer_id ? await Customer.findById(o.customer_id) : null;
            const user = customer?.user_id ? await User.findById(customer.user_id).select('firstName lastName email phone') : null;
            const items = await OrderItem.find({ order_id: o._id }).sort({ _id: 1 });

            const orderItems = [];
            for (const oi of items) {
                const product = await Product.findById(oi.product_id);
                let category = null;
                if (product?.category_id) {
                    const cat = await Category.findById(product.category_id);
                    category = cat ? { id: cat._id, name: cat.name } : null;
                }

                let variant_material = null;
                if (oi.variant_id) {
                    const variant = await ProductVariant.findById(oi.variant_id);
                    variant_material = variant ? variant.material : null;
                }

                orderItems.push({
                    order_item_id: oi._id,
                    product_id: product?._id || null,
                    product_name: product?.name || null,
                    product_price: product?.price || null,
                    quantity: oi.quantity,
                    item_price: oi.price,
                    category,
                    variant_id: oi.variant_id || null,
                    variant_material,
                });
            }

            recentOrders.push({
                order_id: o._id,
                order_date: o.order_date,
                payment_method: o.payment_method,
                shipping_address: o.shipping_address,
                is_paid: o.is_paid,
                receipt_url: o.receipt_url,
                order_status: o.status,
                order_created_at: o.created_at,
                customer: customer ? {
                    id: customer._id,
                    customer_name: customer.customer_name,
                    location: customer.location,
                } : { id: null, customer_name: null, location: null },
                user: user ? {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                } : { id: null, firstName: null, lastName: null, email: null, phone: null },
                items: orderItems,
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                recent_orders: recentOrders,
            },
        }, { status: 200 });
    } catch (error) {
        console.error("Error Getting Orders Data:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}

//Edit Orders
export async function PUT(request) {
    try {
        //Database Connection
        await connectDB();
        const body = await request.json();

        const {
            order_id,
            status,
            is_paid,
            shipping_address,
            receipt_url,
            payment_method
        } = body;

        //Basic Validation Check
        if (!order_id) {
            return NextResponse.json({
                success: false,
                message: "Order ID is required"
            }, { status: 400 });
        }

        // Build dynamic update fields
        const updateFields = {};
        if (status !== undefined) updateFields.status = status;
        if (is_paid !== undefined) updateFields.is_paid = is_paid;
        if (shipping_address !== undefined) updateFields.shipping_address = shipping_address;
        if (receipt_url !== undefined) updateFields.receipt_url = receipt_url;
        if (payment_method !== undefined) updateFields.payment_method = payment_method;

        if (Object.keys(updateFields).length === 0) {
            return NextResponse.json(
                { success: false, message: "No fields provided to update." },
                { status: 400 }
            );
        }

        // Update Order
        const result = await Order.updateOne({ _id: order_id }, updateFields);

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { success: false, message: "Order not found." },
                { status: 404 }
            );
        }

        // Fetch updated order
        const updatedOrder = await Order.findById(order_id);

        return NextResponse.json({
            success: true,
            message: "Order updated successfully",
            data: updatedOrder
        }, { status: 200 });
    } catch (error) {
        console.error("Error Editing Orders:", error);
        return NextResponse.json({ message: "Error In Backend API Call" });
    }
}

// Delete Order (Only Allowed When Status = Cancelled)
export async function DELETE(request) {
    try {
        await connectDB();
        const body = await request.json();
        const { order_id } = body;

        if (!order_id) {
            return NextResponse.json(
                { success: false, message: "Order ID is required." },
                { status: 400 }
            );
        }

        // Fetch the order to validate status
        const order = await Order.findById(order_id);

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found." },
                { status: 404 }
            );
        }

        if (order.status !== 'Cancelled') {
            return NextResponse.json(
                { success: false, message: "Only Cancelled orders can be deleted." },
                { status: 403 }
            );
        }

        // Delete child order_items first
        await OrderItem.deleteMany({ order_id });

        // Delete the order
        await Order.deleteOne({ _id: order_id });

        console.log(`Order #${order_id} (Cancelled) deleted by Admin.`);

        return NextResponse.json({
            success: true,
            message: "Order deleted successfully."
        }, { status: 200 });
    } catch (error) {
        console.error("Error Deleting Order:", error);
        return NextResponse.json(
            { success: false, message: "Error In Backend API Call" },
            { status: 500 }
        );
    }
}