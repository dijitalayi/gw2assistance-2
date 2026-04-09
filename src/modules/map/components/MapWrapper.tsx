"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the TyriaMap component to prevent SSR
// react-leaflet depends on the 'window' object which is not available on the server.
const DynamicMap = dynamic(
    () => import("./TyriaMap"),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="w-10 h-10 animate-spin text-[#eb5e28] mb-4" />
                <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide animate-pulse">Loading Map Engine...</p>
            </div>
        )
    }
);

export default function MapWrapper() {
    return (
        <div className="w-full h-full relative z-0">
            <DynamicMap />
        </div>
    );
}
