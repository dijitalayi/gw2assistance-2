"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/core/contexts/AuthContext";

export default function MapPage() {
  const { apiKey } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Both Next.js and the Angular livemap share exact same origin (`http://localhost:3000`)
    // If the Angular app relies on LocalStorage or Cookies, they are natively shared.
    // If we need to forcefully inject the API Key via Window messaging later, we can do it here:
    // if (iframeRef.current && iframeRef.current.contentWindow && apiKey) {
    //    iframeRef.current.contentWindow.postMessage({ type: 'SYNC_API_KEY', payload: apiKey }, '*');
    // }
  }, [apiKey]);

  return (
    <div className="-mx-6 -mb-6 lg:-mx-8 lg:-mb-8 mt-2 h-[calc(100vh-140px)] bg-[#212529] rounded-t-xl overflow-hidden shadow-inner border-t border-l border-r border-[#495057] relative">
      {/* 
        The iframe points to the compiled Angular Livemap.
        It sits perfectly inside the Next.js Sidebar and Header wrapper structure.
      */}
      <iframe
        ref={iframeRef}
        src="/livemap/index.html"
        className="absolute inset-0 w-full h-full border-0"
        title="GW2 Interactive Live Map"
      />
    </div>
  );
}
