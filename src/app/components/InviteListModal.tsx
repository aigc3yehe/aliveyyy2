import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '@/app/stores/useGameStore';

interface InviteListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteListModal({ isOpen, onClose }: InviteListModalProps) {
  const { language } = useGameStore();

  // Mock Data
  const inviteData = [
    { address: '0x1A2...3B4', count: 5 },
    { address: '0x8C9...1D2', count: 3 },
    { address: '0x4E5...9F0', count: 2 },
    { address: '0x7B1...2A3', count: 1 },
    { address: '0x9D0...5C6', count: 1 },
    { address: '0x2F3...8E1', count: 0 },
    { address: '0x5A6...4B9', count: 0 },
    { address: '0x3C4...7D2', count: 0 },
    { address: '0x1E9...0F5', count: 0 },
    { address: '0x6B2...3A8', count: 0 },
    { address: '0x0D5...1C4', count: 0 },
    { address: '0x8F7...2E9', count: 0 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-sm bg-black border border-[#00ff41] shadow-[0_0_30px_rgba(0,255,65,0.2)] rounded-lg overflow-hidden flex flex-col max-h-[80vh]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#00ff41]/30 flex items-center justify-between bg-[#00ff41]/5">
              <h3 className="text-[#00ff41] font-mono text-lg font-bold">
                {language === 'en' ? 'INVITATION LOG' : '邀请记录'}
              </h3>
              <button 
                onClick={onClose}
                className="text-[#00ff41]/70 hover:text-[#00ff41]"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#00ff41]/20 scrollbar-track-transparent">
              <div className="grid grid-cols-2 gap-2 px-2 py-2 text-xs text-gray-500 font-mono border-b border-[#00ff41]/10 mb-2">
                <div>{language === 'en' ? 'Direct Invites' : '直接邀请成功'}</div>
                <div className="text-right">{language === 'en' ? 'Indirect Invites' : '间接邀请数'}</div>
              </div>
              
              {inviteData.map((item, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 px-2 py-3 hover:bg-[#00ff41]/5 border-b border-[#00ff41]/5 last:border-0 font-mono text-sm">
                  <div className="text-gray-300">{item.address}</div>
                  <div className="text-right text-[#00ff41]">{item.count}</div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[#00ff41]/30 bg-[#00ff41]/5 text-center">
              <p className="text-[10px] text-[#00ff41]/60 font-mono leading-relaxed px-2">
                {language === 'en' 
                  ? 'Directly invite friends to earn 33% of the activation BNB fee, and indirectly invite friends to earn 13%.' 
                  : '直接邀请朋友赚取 33% 的激活BNB费用，间接邀请朋友赚取 13% 的激活BNB费用。'}
              </p>
            </div>
            
            {/* Scanline */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.1) 2px, rgba(0, 255, 65, 0.1) 4px)',
              }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
