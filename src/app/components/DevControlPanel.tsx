import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/app/stores/useGameStore';
import { useDecorationStore, BedVariant } from '@/app/stores/useDecorationStore';
import { Card } from '@/app/components/ui/card';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const BED_OPTIONS: { value: BedVariant; label: string }[] = [
  { value: 'default', label: '默认 Default' },
  { value: 'doll', label: '娃娃 Doll' },
];

export function DevControlPanel() {
  const { isAlive, maxHp, setLastCheckInTime, hp } = useGameStore();
  const { config: decorationConfig, setDecoration } = useDecorationStore();
  const [isOpen, setIsOpen] = useState(false);

  // Toggle Player Status (Alive / Dead)
  const togglePlayerStatus = (checked: boolean) => {
    // If checked (True) -> Make Alive
    // If unchecked (False) -> Make Dead
    
    // In UI we probably want "Simulate Death" switch? 
    // Or "Player Alive" switch. Let's do "Player Alive" switch.
    
    if (checked) {
      // Revive: Set check-in time to now (Full HP)
      setLastCheckInTime(Date.now() / 1000);
    } else {
      // Kill: Set check-in time to (MaxHP + 1) hours ago
      // This forces HP calculation to be 0
      const secondsInHour = 3600;
      const deadTime = Date.now() / 1000 - ((maxHp + 1) * secondsInHour);
      setLastCheckInTime(deadTime);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-end flex-col gap-2">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4 w-64 bg-black/80 backdrop-blur-md border border-[#00ff41]/30 shadow-lg text-[#00ff41]">
              <div className="flex items-center justify-between mb-4 border-b border-[#00ff41]/20 pb-2">
                <h3 className="font-bold text-sm uppercase tracking-wider">Dev Control</h3>
                <button onClick={() => setIsOpen(false)} className="hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Player Status Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Label htmlFor="status-mode" className="font-bold">Player Status</Label>
                    <span className="text-xs text-stone-400">{isAlive ? 'Alive' : 'Lost Contact'}</span>
                  </div>
                  <Switch
                    id="status-mode"
                    checked={isAlive}
                    onCheckedChange={togglePlayerStatus}
                    className="data-[state=checked]:bg-[#00ff41] data-[state=unchecked]:bg-red-500"
                  />
                </div>

                {/* Bed Style Selector */}
                <div className="border-t border-[#00ff41]/10 pt-3">
                  <Label className="font-bold block mb-2">Bed Style 床样式</Label>
                  <div className="flex gap-2">
                    {BED_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setDecoration('bed', option.value)}
                        className={`flex-1 px-2 py-1.5 text-xs rounded border transition-all ${
                          decorationConfig.bed === option.value
                            ? 'bg-[#00ff41]/20 border-[#00ff41] text-[#00ff41]'
                            : 'bg-black/40 border-stone-600 text-stone-400 hover:border-stone-500'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="text-xs text-stone-500 border-t border-[#00ff41]/10 pt-2">
                  <p>Current HP: {hp}/{maxHp}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="rounded-full bg-black/80 border border-[#00ff41]/50 hover:bg-[#00ff41]/20 text-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.3)]"
      >
        <Settings size={20} />
      </Button>
    </div>
  );
}
