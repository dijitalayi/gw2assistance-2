"use client";

import { useAuth } from '@/core/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Key, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { setApiKey, apiKey, isLoading } = useAuth();
  const router = useRouter();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (!isLoading && apiKey) {
      router.push('/');
    }
  }, [apiKey, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setError("Please enter an API Key.");
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);

      // Validate the API key with GW2 API
      const res = await fetch(`https://api.guildwars2.com/v2/tokeninfo?access_token=${inputKey.trim()}`);
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Invalid API Key. Please check and try again.");
        }
        throw new Error("Failed to verify API Key. GW2 API might be down.");
      }

      const data = await res.json();
      
      // We can also check here if data.permissions (scopes) has what we need
      // For now, any valid key is accepted.

      setApiKey(inputKey.trim());
      router.push('/');
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading || apiKey) {
    return null; // Let AuthGuard or the useEffect handle the loading/redirect state
  }

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] dark:bg-[#212529]">
      {/* Left Panel: Aesthetic Background */}
      <div className="hidden lg:flex w-1/2 relative bg-[#212529] items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/assets/background/gw2login.jpg" 
            alt="GW2 Background" 
            fill
            className="object-cover opacity-60"
            priority
          />
          {/* Gradient Overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#212529] via-[#212529]/60 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#212529]"></div>
        </div>

        <div className="relative z-10 p-12 text-center max-w-lg">
          <h1 className="text-4xl font-bold text-white mb-4 tracking-wider uppercase">
            <span className="text-[#eb5e28]">Guild Wars 2</span> Assistant
          </h1>
          <p className="text-gray-300 text-lg">
            Track your account progression, manage your inventory across all characters, and analyze the trading post in real-time.
          </p>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          
          {/* Mobile Text (Hidden on desktop) */}
          <div className="lg:hidden text-center mb-10">
            <h1 className="text-3xl font-bold text-[#212529] dark:text-white mb-2 uppercase tracking-wide">
              <span className="text-[#eb5e28]">GW2</span> Assistant
            </h1>
            <p className="text-[#6c757d]">Manage your account effortlessly.</p>
          </div>

          <div className="bg-white dark:bg-[#343a40] rounded-xl shadow-sm border border-[#dee2e6] dark:border-[#495057] p-8">
            <h2 className="text-2xl font-bold text-[#212529] dark:text-white mb-6">
              Connect Your Account
            </h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#495057] dark:text-[#ced4da] mb-2">
                  API Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-[#6c757d]" />
                  </div>
                  <input
                    type="password"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-[#ced4da] dark:border-[#495057] rounded-lg bg-[#f8f9fa] dark:bg-[#212529] text-[#212529] dark:text-white placeholder-[#adb5bd] dark:placeholder-[#6c757d] focus:outline-none focus:ring-2 focus:ring-[#eb5e28] focus:border-transparent transition-all"
                    placeholder="Enter your GW2 API Key"
                  />
                </div>
                <p className="mt-2 text-xs text-[#6c757d]">
                  Your API key is stored securely in your browser and is never sent to our servers.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-l-4 border-red-500 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying || !inputKey.trim()}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#eb5e28] hover:bg-[#d65525] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eb5e28] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Account"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#dee2e6] dark:border-[#495057]">
              <a 
                href="https://account.arena.net/applications" 
                target="_blank" 
                rel="noreferrer"
                className="text-sm font-medium text-[#eb5e28] hover:underline flex items-center justify-center"
              >
                Where do I get an API Key?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
