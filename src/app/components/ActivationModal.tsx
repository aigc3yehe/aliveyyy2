import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '@/app/stores/useGameStore';
import { useAuth } from '@/app/hooks/useAuth';
import { toast } from 'sonner';
import { useState, memo } from 'react';
import { LogOut, ShoppingBag, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { formatTokenCount } from '@/utils/format';
import { useTranslation } from 'react-i18next';

export const ActivationModal = memo(function ActivationModal() {
  const isAccountActivated = useGameStore(state => state.isAccountActivated);
  const isActivationChecked = useGameStore(state => state.isActivationChecked);
  const activateAccount = useGameStore(state => state.activateAccount);
  const globalStats = useGameStore(state => state.globalStats);

  const { t } = useTranslation();
  const { logout } = useAuth();
  const [isActivating, setIsActivating] = useState(false);
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite');

  // Debug log
  console.log('ActivationModal render:', { isAccountActivated, isActivationChecked, inviteCode });

  // Don't show modal if:
  // 1. User is already activated (from cache or backend)
  // 2. Backend hasn't responded yet (to prevent flash)
  if (isAccountActivated || !isActivationChecked) return null;

  const handleActivation = async () => {
    setIsActivating(true);
    try {
      await activateAccount();
      toast.success(t('activationModal.success'), {
        description: t('activationModal.welcome')
      });
    } catch (error) {
      console.error('Activation failed:', error);
      toast.error(t('activationModal.failed'));
    } finally {
      setIsActivating(false);
    }
  };

  // Calculate estimated daily earnings for a new user
  // Assumption: New user start with weight ~1.0 (Multiplier 1.0 * Dopamine 1.0)
  // Backend uses WEIGHT_SCALE = 10000 for precision, so 1.0 => 10000
  const DEFAULT_USER_WEIGHT = 10000;

  const dailyPoolTotal = parseFloat(globalStats?.dailyPoolTotal || '0');
  const totalWeight = parseFloat(globalStats?.totalRewardWeight || '0');

  // Avoid division by zero if fresh game
  const estimatedShare = totalWeight + DEFAULT_USER_WEIGHT > 0
    ? DEFAULT_USER_WEIGHT / (totalWeight + DEFAULT_USER_WEIGHT)
    : 1; // If no one else, you get 100%? Or 0? Let's assume reasonable start.

  // If global stats missing, fallback to 0 or a placeholder. 
  // Ideally we should have stats. If not, defaulting to 0 is safer than misleading huge number.
  const estimatedDailyEarnings = globalStats ? (dailyPoolTotal / 1e18) * estimatedShare : 0;

  const estimatedDailyFormatted = formatTokenCount(estimatedDailyEarnings);

  const feeAmount = import.meta.env.VITE_ACTIVATION_FEE || '0.015';

  return (
    <AnimatePresence>
      <motion.div
        key="activation-modal-overlay"
        className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Blocking Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal Window */}
        <motion.div
          className="relative w-[90%] max-w-[400px] bg-black border-2 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden rounded-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          {/* Header */}
          <div className="bg-amber-500/10 p-4 border-b border-amber-500/30 flex items-center justify-between">
            <h2 className="text-amber-500 font-mono text-lg font-bold tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              {t('activationModal.title')}
            </h2>
            <button
              onClick={logout}
              className="text-amber-500/70 hover:text-amber-500 transition-colors"
              title={t('activationModal.disconnect')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="text-center">
              <p className="text-gray-400 font-mono text-sm leading-relaxed mb-6">
                {t('activationModal.description')}
              </p>

              {/* Fee Display */}
              <div className="bg-amber-900/10 border border-amber-500/30 p-4 rounded-lg mb-4">
                <p className="text-amber-400 font-mono text-sm mb-1 uppercase tracking-widest opacity-80">
                  {t('activationModal.feeTitle')}
                </p>
                <div className="text-3xl font-bold text-white font-mono" style={{ textShadow: '0 0 10px rgba(245, 158, 11, 0.5)' }}>
                  {feeAmount} BNB
                </div>

                {/* Fee Distribution */}
                <div className="mt-3 pt-3 border-t border-amber-500/20 text-[10px] text-amber-200/70 font-mono space-y-1">
                  <p className="opacity-50 mb-1">{t('activationModal.feeDistribution')}</p>
                  <div className="flex justify-between items-center">
                    <span>{t('activationModal.directInviter')}</span>
                    <span className="text-amber-400 font-bold">33%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('activationModal.indirectInviter')}</span>
                    <span className="text-amber-400 font-bold">13%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('activationModal.pool')}</span>
                    <span className="text-[#00ff41] font-bold">50%</span>
                  </div>
                </div>
              </div>

              {/* Daily Pool Estimate */}
              <div className="bg-[#00ff41]/5 border border-[#00ff41]/20 p-4 rounded-lg">
                <p className="text-[#00ff41] font-mono text-xs mb-1 uppercase tracking-widest opacity-80">
                  {t('activationModal.estDaily')}
                </p>
                <div className="text-2xl font-bold text-[#00ff41] font-mono" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.3)' }}>
                  {estimatedDailyFormatted} $活着呢
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleActivation}
              disabled={isActivating}
              className={`w-full py-4 font-mono text-lg font-bold uppercase tracking-wider transition-all duration-200 border-2 rounded-lg flex items-center justify-center gap-2
                ${isActivating
                  ? 'bg-amber-900/20 border-amber-800 text-amber-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#00ff41] to-[#008f11] hover:from-[#00ff41] hover:to-[#00cc33] border-transparent text-black shadow-[0_0_20px_rgba(0,255,65,0.4)]'
                }
              `}
            >
              {isActivating
                ? t('activationModal.processing')
                : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {t('activationModal.payAndActivate')}
                  </>
                )
              }
            </button>

            <div className="space-y-2">
              <p className="text-center text-gray-600 text-xs font-mono">
                {t('activationModal.oneTime')}
              </p>

              {/* Referrer Info */}
              {inviteCode && (
                <p className="text-center text-gray-500 text-[10px] font-mono border-t border-gray-800 pt-2 mt-2">
                  {t('activationModal.referrer', { code: inviteCode })}
                </p>
              )}
            </div>
          </div>

          {/* Scanline Effect */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(245, 158, 11, 0.1) 2px, rgba(245, 158, 11, 0.1) 4px)',
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
