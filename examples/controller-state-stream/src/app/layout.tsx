import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { Inter } from "next/font/google";
import { getExposedRuntimeEnv } from "@/runtimeEnv.ts";
import { ClientLayout } from "./ClientLayout.tsx";
import "./global.css";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ClientLayout env={getExposedRuntimeEnv()}>{children}</ClientLayout>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
