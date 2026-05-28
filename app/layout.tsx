import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import BottomNav from "@/components/BottomNav/BottomNav";
import GlobalElements from "@/components/GlobalElements";
import { GoogleAnalytics } from '@next/third-parties/google';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { FEATURE_FLAGS } from "@/lib/config";
import { connectDB } from "@/lib/mongodb";
import SystemSetting from "@/models/SystemSetting";

export async function generateMetadata(): Promise<Metadata> {
  let title = "Tronics Store – MLBB Diamond Top Up | Instant & Secure";
  let description = "Tronics Store is a fast and secure Mobile Legends (MLBB) diamond top-up platform. Instant delivery, safe payments, and 24/7 automated service.";
  let keywords = "mlbb top up, buy diamonds, mobile legends diamonds";

  try {
    await connectDB();
    const settings = await SystemSetting.find({ 
      key: { $in: ['SEO_TITLE', 'SEO_DESCRIPTION', 'SEO_KEYWORDS'] } 
    }).lean();
    
    const titleSetting = settings.find((s: any) => s.key === 'SEO_TITLE');
    if (titleSetting && titleSetting.value) title = titleSetting.value;

    const descSetting = settings.find((s: any) => s.key === 'SEO_DESCRIPTION');
    if (descSetting && descSetting.value) description = descSetting.value;

    const kwSetting = settings.find((s: any) => s.key === 'SEO_KEYWORDS');
    if (kwSetting && Array.isArray(kwSetting.value) && kwSetting.value.length > 0) {
      keywords = `${keywords}, ${kwSetting.value.join(", ")}`;
    }
  } catch (err) {
    console.error("Failed to load SEO settings", err);
  }

  return {
    title,
    description,
    keywords,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>

          <Header />
          <main className="pt-14 pb-24 lg:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <GlobalElements />
        </GoogleOAuthProvider>

      </body>
      <GoogleAnalytics gaId="G-RBPY9YC6V6" />
      {/* <script src="https://quge5.com/88/tag.min.js" data-zone="191906" async data-cfasync="false"></script> */}
    </html>
  );
}
