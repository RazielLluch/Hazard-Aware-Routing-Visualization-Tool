import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { cn } from "@/lib/utils";
import React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { resolveJourneyContext } from "@/lib/journey";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hazard Aware Last Mile Logistics",
  description:
    "A Deep Reinforcement Learning Framework for Hazard-Aware Routing in Disaster-Prone Rural Road Networks: Leveraging Project NOAH Data for Last-Mile Logistics",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { defaultBenchmarkId, defaultScenarioId } = await resolveJourneyContext();

  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar
              defaultBenchmarkId={defaultBenchmarkId}
              defaultScenarioId={defaultScenarioId}
            />
            <SidebarInset>
              <SiteHeader />
              {children}
            </SidebarInset>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
