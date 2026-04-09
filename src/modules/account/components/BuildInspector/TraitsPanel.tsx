'use client';

import React from 'react';

interface Specialization {
  id: number;
  traits: (number | null)[];
}

interface TraitsPanelProps {
  specializations?: Specialization[];
}

export function TraitsPanel({ specializations }: TraitsPanelProps) {
  const activeSpecs = specializations ?? [];

  if (!activeSpecs || activeSpecs.length === 0) {
    return (
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#eb5e28] mb-3 flex items-center gap-2">
          <span className="w-4 h-px bg-[#eb5e28]" />
          Build / Specializations
        </h3>
        <p className="text-xs text-gray-500">Build data not found.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#eb5e28] flex items-center gap-2">
          <span className="w-4 h-px bg-[#eb5e28]" />
          Build / Specializations
        </h3>
      </div>

      {/* armory-embeds: specializations embed (vertical stack) */}
      <div className="flex flex-col gap-3">
        {activeSpecs.map((spec, idx) => {
          if (!spec || !spec.id) return null;

          const traits = spec.traits?.filter(Boolean) ?? [];
          const traitsAttr = traits.length > 0
            ? { [`data-armory-${spec.id}-traits`]: traits.join(',') }
            : {};

          return (
            <div key={idx} className="bg-[#111] rounded-lg p-2 border border-[#2a2a2a] hover:border-[#eb5e28]/30 transition-colors">
              <div
                data-armory-embed="specializations"
                data-armory-ids={String(spec.id)}
                {...traitsAttr as any}
                className="w-full"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
