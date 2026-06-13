import { connectDB } from "@/lib/mongodb";
import SystemSetting from "@/models/SystemSetting";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await connectDB();

        const orderSetting = await SystemSetting.findOne({ key: "STOP_ACCEPTING_ORDERS" }).lean();

        return NextResponse.json({
            success: true,
            stopAcceptingOrders: orderSetting ? orderSetting.value : false,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
