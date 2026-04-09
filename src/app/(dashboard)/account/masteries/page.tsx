'use client';

import React from 'react';
import { MasteryTracker } from '@/modules/account/components/Masteries/MasteryTracker';

export default function MasteriesPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <MasteryTracker />
      </div>
    </div>
  );
}
