'use client';

import React from 'react';
import { AchievementTracker } from '@/modules/account/components/Achievements/AchievementTracker';

export default function AchievementsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <AchievementTracker />
      </div>
    </div>
  );
}
