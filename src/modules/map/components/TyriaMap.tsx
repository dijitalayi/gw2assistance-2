"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChevronLeft, Home, Layers, Settings, Users, Sword } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Fix for default Leaflet icons failing to load in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/assets/map/waypoint.png',
    iconUrl: '/assets/map/waypoint.png',
    shadowUrl: '',
});

const TYRIA_DIMENSIONS: L.PointTuple = [81920, 114688];
const MAX_ZOOM = 7;
const MIN_ZOOM = 2;

function MapController() {
    const map = useMap();

    useEffect(() => {
        map.options.crs = L.CRS.Simple;

        // Set boundaries to Tyria continent limits
        const bounds = new L.LatLngBounds(
            map.unproject([0, 0], MAX_ZOOM),
            map.unproject(TYRIA_DIMENSIONS, MAX_ZOOM)
        );

        map.setMaxBounds(bounds);
        map.options.maxBoundsViscosity = 1;
        map.options.preferCanvas = true;

        // Starting coordinates
        map.setView(map.unproject([35000, 48000], MAX_ZOOM), 4);

    }, [map]);

    return null;
}

// Reusable Toolbar Component
const ToolbarButton = ({ icon: Icon, tooltip, onClick, href }: any) => {
    const inner = (
        <div className="bg-[#212529]/90 hover:bg-[#eb5e28] backdrop-blur-sm transition-all duration-300 rounded-lg p-3 cursor-pointer shadow-lg border border-[#343a40] group">
            <Icon className="w-5 h-5 text-gray-200 group-hover:text-white" />
        </div>
    );

    if (href) {
        return <Link href={href} title={tooltip}>{inner}</Link>;
    }
    return <div onClick={onClick} title={tooltip}>{inner}</div>;
}

export default function TyriaMap() {
    const [showLayers, setShowLayers] = useState(false);

    return (
        <div className="w-full h-screen bg-[#000] relative overflow-hidden">

            {/* Overlaid Toolbars (maps.gw2.io 1-to-1 style) */}

            {/* Top Left Toolbar */}
            <div className="absolute top-4 left-4 z-[999] flex flex-col gap-2">
                <ToolbarButton href="/" icon={Home} tooltip="Return to Dashboard" />
                <ToolbarButton icon={Layers} tooltip="Layers" onClick={() => setShowLayers(!showLayers)} />
                <ToolbarButton icon={Users} tooltip="Live Markers" />
                <ToolbarButton icon={Settings} tooltip="Settings" />
            </div>

            {/* Top Right Toolbar */}
            <div className="absolute top-4 right-4 z-[999] flex flex-col gap-2">
                <ToolbarButton icon={Sword} tooltip="World vs. World" />
            </div>

            {/* Floating Panel Example (Layers) */}
            {showLayers && (
                <div className="absolute top-4 left-20 z-[999] bg-[#212529]/95 backdrop-blur-md border border-[#343a40] rounded-xl shadow-2xl p-4 w-60 text-white animate-in fade-in slide-in-from-left-2">
                    <h3 className="font-bold border-b border-[#495057] pb-2 mb-3">Map Layers</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                            <input type="checkbox" defaultChecked className="accent-[#eb5e28]" /> Waypoints
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                            <input type="checkbox" defaultChecked className="accent-[#eb5e28]" /> Points of Interest
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                            <input type="checkbox" defaultChecked className="accent-[#eb5e28]" /> Vistas
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
                            <input type="checkbox" defaultChecked className="accent-[#eb5e28]" /> Hero Points
                        </label>
                    </div>
                </div>
            )}

            {/* Map Container */}
            <MapContainer
                center={[0, 0]}
                zoom={4}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                crs={L.CRS.Simple}
                style={{ height: '100vh', width: '100vw', background: '#000' }}
                zoomControl={false} // Customizing UI so we hide default zoom
            >
                <MapController />

                <TileLayer
                    url="https://tiles{s}.guildwars2.com/1/1/{z}/{x}/{y}.jpg"
                    subdomains={["1", "2", "3", "4"]}
                    noWrap={true}
                    attribution='&copy; NCSOFT Corporation'
                />

                <Marker position={[-250, 450] as L.LatLngTuple}>
                    <Popup>
                        <div className="font-outfit text-[#212529] font-bold">
                            Lion's Arch
                        </div>
                        <div className="text-sm text-gray-600">Core Tyria</div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
