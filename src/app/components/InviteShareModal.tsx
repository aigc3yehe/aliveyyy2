import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '@/app/stores/useGameStore';
import { Copy, Users, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { InviteListModal } from './InviteListModal';

interface InviteShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteShareModal({ isOpen, onClose }: InviteShareModalProps) {
  const { language } = useGameStore();
  const [showList, setShowList] = useState(false);

  // Mock Stats
  const directInvites = 12;
  const indirectInvites = 25;
  const inviteLink = 'huozhene.io/?invite=1234a';

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${inviteLink}`);
    toast.success(language === 'en' ? 'Link Copied!' : '链接已复制！');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !showList && (
          <div className="fixed inset-0 z-[110]">
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={onClose}
            />
            <div className="absolute inset-0 flex items-start justify-center p-4 pt-32 pointer-events-none">
              <motion.div
                className="relative w-full max-w-sm bg-black border-2 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)] rounded-xl overflow-hidden pointer-events-auto"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
              >
                {/* Header */}
                <div className="bg-amber-500/10 p-5 border-b border-amber-500/30 flex items-center justify-between">
                  <h2 className="text-amber-500 font-mono text-xl font-bold tracking-wider flex items-center gap-2">
                    <span className="text-2xl">👑</span>
                    {language === 'en' ? 'INVITE & EARN' : '邀请赚取奖励'}
                  </h2>
                  <button 
                    onClick={onClose}
                    className="text-amber-500/70 hover:text-amber-500 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-amber-900/10 border border-amber-500/30 p-3 rounded-lg text-center">
                      <p className="text-amber-500/70 text-[10px] uppercase font-bold tracking-wider mb-1">
                        {language === 'en' ? 'Direct Invites' : '成功邀请'}
                      </p>
                      <p className="text-2xl font-bold text-white font-mono">{directInvites}</p>
                    </div>
                    <div className="bg-amber-900/10 border border-amber-500/30 p-3 rounded-lg text-center">
                      <p className="text-amber-500/70 text-[10px] uppercase font-bold tracking-wider mb-1">
                        {language === 'en' ? 'Indirect Invites' : '间接邀请'}
                      </p>
                      <p className="text-2xl font-bold text-white font-mono">{indirectInvites}</p>
                    </div>
                  </div>

                  {/* Promo Text */}
                  <div className="text-center space-y-2">
                    <p className="text-amber-100 font-mono text-sm leading-relaxed">
                    {language === 'en' 
                      ? 'Directly invite friends to earn 33% of the activation BNB fee, and indirectly invite friends to earn 13%.' 
                      : '直接邀请朋友赚取 33% 的激活BNB费用，间接邀请朋友赚取 13% 的激活BNB费用。'}
                  </p>
                  </div>

                  {/* Link Section */}
                  <div className="bg-black border border-amber-500/50 rounded-lg p-1 pl-3 flex items-center gap-2">
                    <div className="flex-1 font-mono text-gray-300 text-sm truncate select-all">
                      {inviteLink}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded font-bold text-sm transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {language === 'en' ? 'COPY' : '复制'}
                    </button>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => setShowList(true)}
                    className="w-full py-3 text-amber-500/80 hover:text-amber-500 border border-amber-500/30 hover:border-amber-500/60 rounded-lg text-sm font-mono flex items-center justify-center gap-2 transition-all"
                  >
                    <Users className="w-4 h-4" />
                    {language === 'en' ? 'View Invite Details' : '查看邀请信息'}
                  </button>
                </div>

                 {/* Scanline */}
                 <div 
                  className="absolute inset-0 pointer-events-none opacity-5"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(245, 158, 11, 0.2) 2px, rgba(245, 158, 11, 0.2) 4px)',
                  }}
                />
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <InviteListModal 
        isOpen={showList} 
        onClose={() => setShowList(false)} 
      />
    </>
  );
}
