"use client";

import { EventDashboard } from '@/modules/events/components/EventDashboard';

export default function EventsPage() {
  return (
    <div className="h-full flex flex-col p-4 lg:p-8">
      {/* Dynamic Sub-header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Global Live Events</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Server-wide event schedule operating on exact UTC times across all megaserver instances.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <EventDashboard />
      </div>
    </div>
  );
}
