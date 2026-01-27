import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useGameStore } from '@/app/stores/useGameStore';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import { useTranslation } from 'react-i18next';

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const { language } = useGameStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'doctrine' | 'rules'>('doctrine');

  const content = {
    doctrine: {
      title: t('info.doctrine.title'),
      body: (
        <div className="space-y-6 font-mono text-sm leading-relaxed text-gray-300">
          <h3 className="text-[#00ff41] text-lg font-bold mb-4">
            {t('info.doctrine.heading')}
          </h3>
          <p>
            {t('info.doctrine.p1')}
          </p>
          <p>
            {t('info.doctrine.p2')}
          </p>
          <p>
            {t('info.doctrine.p3')}
          </p>
        </div>
      )
    },
    rules: {
      title: t('info.rules.title'),
      body: (
        <div className="space-y-6 font-mono text-sm">
          <h3 className="text-[#00ff41] text-lg font-bold mb-4">
            {t('info.rules.survivalLaws')}
          </h3>

          <div className="border border-[#00ff41]/30 rounded-sm overflow-hidden">
            <div className="grid grid-cols-[100px_1fr] border-b border-[#00ff41]/30">
              <div className="p-3 bg-[#00ff41]/5 text-[#00ff41] font-bold border-r border-[#00ff41]/30">
                {t('info.rules.hp')}
              </div>
              <div className="p-3 text-gray-300">
                {t('info.rules.hpDesc')}
              </div>
            </div>

            <div className="grid grid-cols-[100px_1fr] border-b border-[#00ff41]/30">
              <div className="p-3 bg-[#00ff41]/5 text-[#00ff41] font-bold border-r border-[#00ff41]/30">
                {t('info.rules.checkin')}
              </div>
              <div className="p-3 text-gray-300">
                {t('info.rules.checkinDesc')}
              </div>
            </div>

            <div className="grid grid-cols-[100px_1fr] border-b border-[#00ff41]/30">
              <div className="p-3 bg-[#00ff41]/5 text-[#00ff41] font-bold border-r border-[#00ff41]/30">
                {t('info.rules.dopamine')}
              </div>
              <div className="p-3 text-gray-300">
                {t('info.rules.dopamineDesc')}
              </div>
            </div>

            <div className="grid grid-cols-[100px_1fr]">
              <div className="p-3 bg-[#00ff41]/5 text-[#00ff41] font-bold border-r border-[#00ff41]/30">
                {t('info.rules.claim')}
              </div>
              <div className="p-3 text-gray-300">
                {t('info.rules.claimDesc')}
              </div>
            </div>
          </div>

          <div className="p-3 border-l-2 border-yellow-500 bg-yellow-500/5 text-yellow-500/80 text-xs">
            {t('info.rules.survivalTip')}
          </div>
        </div>
      )
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            className="fixed left-1/2 top-[15%] -translate-x-1/2 w-[90%] max-w-[500px] h-[600px] bg-black border-2 border-[#00ff41] z-[101] flex flex-col"
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-[#00ff41]/30">
              <h2 className="text-[#00ff41] font-mono text-xl font-bold tracking-wider">
                {'>'} {t('info.systemInfo')}
              </h2>
              <button
                onClick={onClose}
                className="text-[#00ff41] hover:bg-[#00ff41]/10 p-1 rounded transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#00ff41]/30">
              <button
                className={`flex-1 py-3 font-mono font-bold transition-colors ${activeTab === 'doctrine'
                    ? 'bg-[#00ff41] text-black'
                    : 'text-[#00ff41] hover:bg-[#00ff41]/10'
                  }`}
                onClick={() => setActiveTab('doctrine')}
              >
                {content.doctrine.title}
              </button>
              <button
                className={`flex-1 py-3 font-mono font-bold transition-colors ${activeTab === 'rules'
                    ? 'bg-[#00ff41] text-black'
                    : 'text-[#00ff41] hover:bg-[#00ff41]/10'
                  }`}
                onClick={() => setActiveTab('rules')}
              >
                {content.rules.title}
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {content[activeTab].body}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#00ff41]/30 text-center">
              <p className="text-gray-600 font-mono text-xs">
                // {t('info.footer')}
              </p>
            </div>

            {/* CRT Scanline Effect */}
            <div
              className="absolute inset-0 pointer-events-none z-[102]"
              style={{
                background:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.03) 2px, rgba(0, 255, 65, 0.03) 4px)',
                boxShadow: 'inset 0 0 20px rgba(0, 255, 65, 0.1)'
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
