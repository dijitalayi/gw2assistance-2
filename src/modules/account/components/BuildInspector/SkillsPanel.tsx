'use client';

import React from 'react';

interface SkillSet {
  heal: number;
  utilities: number[];
  elite: number;
}

interface SkillsPanelProps {
  skills?: SkillSet;
  title?: string;
}

export function SkillsPanel({ skills, title = 'Skill Bar' }: SkillsPanelProps) {
  const activeSkills = skills;

  if (!activeSkills) {
    return (
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#eb5e28] mb-3 flex items-center gap-2">
          <span className="w-4 h-px bg-[#eb5e28]" />
          Skill Bar
        </h3>
        <p className="text-xs text-gray-500">Skill data not found.</p>
      </div>
    );
  }

  const { heal, utilities, elite } = activeSkills;
  const allSkillIds = [heal, ...utilities, elite].filter(id => id > 0);

  return (
    <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4 mt-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#eb5e28] mb-4 flex items-center gap-2">
        <span className="w-4 h-px bg-[#eb5e28]" />
        Skill Bar
      </h3>

      <div className="flex items-center justify-center gap-3">
        {/* Heal Skill */}
        <SkillSlot id={heal} label="Heal" />

        <div className="w-px h-8 bg-[#2a2a2a] mx-1" />

        {/* Utilities */}
        {utilities.map((id, index) => (
          <SkillSlot key={`${id}-${index}`} id={id} label={`Utility ${index + 1}`} />
        ))}

        <div className="w-px h-8 bg-[#2a2a2a] mx-1" />

        {/* Elite */}
        <SkillSlot id={elite} label="Elite" />
      </div>
    </div>
  );
}

function SkillSlot({ id, label }: { id: number; label: string }) {
  if (id <= 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 opacity-40">
        <div className="w-12 h-12 rounded-lg bg-[#111] border border-[#2a2a2a] flex items-center justify-center text-xs text-gray-600">
          ?
        </div>
        <span className="text-[10px] text-gray-600 uppercase tracking-tighter">{label}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5 group">
      <div
        data-armory-embed="skills"
        data-armory-ids={id}
        data-armory-size="48"
        className="rounded-lg overflow-hidden border border-[#2a2a2a] group-hover:border-[#eb5e28]/50 transition-all duration-300 shadow-lg"
      />
      <span className="text-[10px] text-gray-500 uppercase tracking-tighter group-hover:text-gray-300 transition-colors">{label}</span>
    </div>
  );
}
