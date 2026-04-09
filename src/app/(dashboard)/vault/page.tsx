import { Metadata } from 'next';
import { VaultTracker } from '@/modules/vault/components/VaultTracker';
import { Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: "Wizard's Vault - GW2 Control",
  description: "Track your Guild Wars 2 Wizard's Vault progression.",
};

export default function VaultPage() {
  return (
    <div className="w-full flex-grow flex flex-col p-6 max-w-7xl mx-auto overflow-y-auto">
      <VaultTracker />
    </div>
  );
}
