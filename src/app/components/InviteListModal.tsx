import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { useReferralList } from '@/app/hooks/useReferralData';
import { Loader2 } from 'lucide-react';
import { formatEther } from 'viem';

interface InviteListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper to truncate address
const truncateAddress = (address: string) => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export function InviteListModal({ isOpen, onClose }: InviteListModalProps) {
  const { t } = useTranslation();
  const { address } = useAccount();

  // Fetch referral lists from subgraph using custom hook
  const { level1Referrals, level2Referrals, isLoading: fetching } = useReferralList(
    address,
    isOpen
  );

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
                {t('inviteList.title')}
              </h3>
              <button
                onClick={onClose}
                className="text-[#00ff41]/70 hover:text-[#00ff41]"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#00ff41]/20 scrollbar-track-transparent flex-1">
              {fetching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#00ff41]" />
                </div>
              ) : (
                <>
                  {/* Level 1 Section */}
                  <div className="mb-4">
                    <div className="px-2 py-2 text-xs text-[#00ff41] font-mono font-bold border-b border-[#00ff41]/20 mb-2">
                      {t('inviteList.directInvites', { count: level1Referrals.length })}
                    </div>
                    {level1Referrals.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4 font-mono">
                        {t('inviteList.noDirect')}
                      </p>
                    ) : (
                      level1Referrals.map((item) => (
                        <div key={item.id} className="grid grid-cols-2 gap-2 px-2 py-3 hover:bg-[#00ff41]/5 border-b border-[#00ff41]/5 last:border-0 font-mono text-sm">
                          <div className="text-gray-300">{truncateAddress(item.invitee.id)}</div>
                          <div className="text-right text-[#00ff41]">
                            +{Number(formatEther(BigInt(item.rewardAmount))).toFixed(5)} BNB
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Level 2 Section */}
                  <div>
                    <div className="px-2 py-2 text-xs text-amber-500 font-mono font-bold border-b border-amber-500/20 mb-2">
                      {t('inviteList.indirectInvites', { count: level2Referrals.length })}
                    </div>
                    {level2Referrals.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4 font-mono">
                        {t('inviteList.noIndirect')}
                      </p>
                    ) : (
                      level2Referrals.map((item) => (
                        <div key={item.id} className="grid grid-cols-2 gap-2 px-2 py-3 hover:bg-amber-500/5 border-b border-amber-500/5 last:border-0 font-mono text-sm">
                          <div className="text-gray-300">{truncateAddress(item.invitee.id)}</div>
                          <div className="text-right text-amber-500">
                            +{Number(formatEther(BigInt(item.rewardAmount))).toFixed(5)} BNB
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[#00ff41]/30 bg-[#00ff41]/5 text-center">
              <p className="text-[10px] text-[#00ff41]/60 font-mono leading-relaxed px-2">
                {t('inviteShareModal.promo')}
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

