import { connectDB } from "@/lib/mongodb";
import SystemSetting from "@/models/SystemSetting";

export async function GET(req) {
    try {
        await connectDB();
        const setting = await SystemSetting.findOne({ key: "FLASH_SALE_CONFIG" }).lean();

        if (!setting || !setting.value) {
            return Response.json({ success: true, data: null });
        }

        return Response.json({
            success: true,
            data: setting.value,
        });
    } catch (err) {
        console.error(err);
        return Response.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
