'use client';

import React, { useState } from 'react';
import { useAuth } from '@/core/contexts/AuthContext';
import { Shield, CheckCircle2, AlertCircle, Key, RefreshCcw, LogOut } from 'lucide-react';

export function ApiCard() {
    const { apiKey, setApiKey } = useAuth();
    const [inputValue, setInputValue] = useState(apiKey || '');
    const [status, setStatus] = useState<'IDLE' | 'SAVING' | 'SUCCESS'>('IDLE');

    const handleSave = () => {
        setStatus('SAVING');
        setTimeout(() => {
            setApiKey(inputValue);
            setStatus('SUCCESS');
            setTimeout(() => setStatus('IDLE'), 2000);
        }, 800);
    };

    const handleClear = () => {
        setApiKey(null);
        setInputValue('');
    };

    return (
        <div className="bg-[#111318]/40 border border-white/10 rounded-3xl p-8 flex flex-col gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Shield className="w-32 h-32 text-orange-500" />
            </div>

            <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-orange-500/10 rounded-2xl">
                    <Key className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-white italic">API Management</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Connect your account to Tyria database</p>
                </div>
            </div>

            <div className="flex flex-col gap-4 relative z-10">
                <div className="relative">
                    <input 
                        type="password" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="ENTER YOUR ARENANET API KEY..." 
                        className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white placeholder:text-gray-800 focus:outline-none focus:border-orange-500/50 transition-all"
                    />
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={handleSave}
                        disabled={status === 'SAVING'}
                        className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-black text-[11px] uppercase tracking-widest ${
                            status === 'SUCCESS' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'
                        }`}
                    >
                        {status === 'SAVING' ? (
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                        ) : status === 'SUCCESS' ? (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Updated
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                    <button 
                        onClick={handleClear}
                        className="px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all font-black"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2 relative z-10 border-t border-white/5 pt-8">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-white font-black uppercase tracking-tighter">Connection</span>
                        <span className="text-[8px] text-gray-600 font-bold uppercase">Active & Secure</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-white font-black uppercase tracking-tighter">Permissions</span>
                        <span className="text-[8px] text-gray-600 font-bold uppercase">Trading/Wallet OK</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
