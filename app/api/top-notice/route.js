import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SystemSetting from "@/models/SystemSetting";

export async function GET() {
    try {
        await connectDB();
        const setting = await SystemSetting.findOne({ key: "NOTICE_BANNER_CONFIG" }).lean();
        
        if (!setting || !setting.value) {
            return NextResponse.json({
                success: true,
                data: {
                    enabled: false,
                    notices: []
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: setting.value
        });
    } catch (error) {
        console.error("Top Notice Fetch Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
