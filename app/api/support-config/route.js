import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SystemSetting from "@/models/SystemSetting";
import { formatSupportConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const setting = await SystemSetting.findOne({ key: "SUPPORT_CONFIG" }).lean();

    const config = formatSupportConfig(setting?.value || {});

    return NextResponse.json(
      {
        success: true,
        data: config,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Support Config Fetch Error:", error);
    return NextResponse.json({
      success: true,
      data: formatSupportConfig({}),
    });
  }
}
