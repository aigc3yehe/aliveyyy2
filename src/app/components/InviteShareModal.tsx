import { motion, AnimatePresence } from 'motion/react';
import { Copy, Users, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { InviteListModal } from './InviteListModal';
import { useAccount } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { useReferralStats } from '@/app/hooks/useReferralData';
import { useGameStore } from '@/app/stores/useGameStore';
import { ActivationModal } from './ActivationModal';

interface InviteShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteShareModal({ isOpen, onClose }: InviteShareModalProps) {
  const isAccountActivated = useGameStore(state => state.isAccountActivated);
  const { address } = useAccount();
  const { t } = useTranslation();
  const [showList, setShowList] = useState(false);
  const [forceActivated, setForceActivated] = useState(false);

  // Fetch referral stats from subgraph using custom hook
  const { directInvites, indirectInvites, isLoading: fetching } = useReferralStats(
    isOpen && isAccountActivated ? address : undefined
  );

  if (isOpen && !isAccountActivated && !forceActivated) {
    return (
      <ActivationModal
        isOpen={isOpen}
        allowClose
        onClose={onClose}
        onActivated={() => setForceActivated(true)}
      />
    );
  }

  // Dynamic Invite Link
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteLink = address
    ? `${origin}?invite=${address}`
    : `${origin}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success(t('inviteShareModal.copied'));
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
                    {t('inviteShareModal.title')}
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
                        {t('inviteShareModal.directInvites')}
                      </p>
                      {fetching ? (
                        <Loader2 className="w-5 h-5 animate-spin text-amber-500 mx-auto" />
                      ) : (
                        <p className="text-2xl font-bold text-white font-mono">{directInvites}</p>
                      )}
                    </div>
                    <div className="bg-amber-900/10 border border-amber-500/30 p-3 rounded-lg text-center">
                      <p className="text-amber-500/70 text-[10px] uppercase font-bold tracking-wider mb-1">
                        {t('inviteShareModal.indirectInvites')}
                      </p>
                      {fetching ? (
                        <Loader2 className="w-5 h-5 animate-spin text-amber-500 mx-auto" />
                      ) : (
                        <p className="text-2xl font-bold text-white font-mono">{indirectInvites}</p>
                      )}
                    </div>
                  </div>

                  {/* Promo Text */}
                  <div className="text-center space-y-2">
                    <p className="text-amber-100 font-mono text-sm leading-relaxed">
                      {t('inviteShareModal.promo')}
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
                      {t('inviteShareModal.copy')}
                    </button>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => setShowList(true)}
                    className="w-full py-3 text-amber-500/80 hover:text-amber-500 border border-amber-500/30 hover:border-amber-500/60 rounded-lg text-sm font-mono flex items-center justify-center gap-2 transition-all"
                  >
                    <Users className="w-4 h-4" />
                    {t('inviteShareModal.viewDetails')}
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
