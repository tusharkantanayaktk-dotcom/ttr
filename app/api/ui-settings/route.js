import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SystemSetting from "@/models/SystemSetting";

export async function GET() {
    try {
        await connectDB();
        const setting = await SystemSetting.findOne({ key: "UI_SETTINGS_CONFIG" }).lean();
        
        // Default values if no config is present in DB yet
        if (!setting || !setting.value) {
            return NextResponse.json({
                success: true,
                data: {
                    showStorySlider: true,
                    showBottomNav: true,
                    showWhatsAppPopup: true
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: setting.value
        });
    } catch (error) {
        console.error("UI Settings Fetch Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
