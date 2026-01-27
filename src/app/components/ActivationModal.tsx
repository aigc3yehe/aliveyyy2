import { motion, AnimatePresence } from 'motion/react';
import { useGameStore } from '@/app/stores/useGameStore';
import { useAuth } from '@/app/hooks/useAuth';
import { toast } from 'sonner';
import { useState } from 'react';
import { LogOut, ShoppingBag, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { formatTokenCount } from '@/utils/format';

export function ActivationModal() {
  const { isAccountActivated, activateAccount, language, globalStats } = useGameStore();
  const { logout } = useAuth();
  const [isActivating, setIsActivating] = useState(false);
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite');

  // Debug log
  console.log('ActivationModal render:', { isAccountActivated, inviteCode });

  // If already activated, don't show anything
  if (isAccountActivated) return null;

  const handleActivation = async () => {
    setIsActivating(true);
    try {
      await activateAccount();
      toast.success(language === 'en' ? 'Account Activated!' : '账户激活成功！', {
        description: language === 'en' ? 'Welcome to Alive.' : '欢迎来到生存证明。'
      });
    } catch (error) {
      console.error('Activation failed:', error);
      toast.error(language === 'en' ? 'Activation Failed' : '激活失败');
    } finally {
      setIsActivating(false);
    }
  };

  // Mock global stats if not available for prototype
  const dailyPool = globalStats?.dailyPoolTotal || '100000000000000000000000'; // 100,000 * 1e18
  const dailyPoolFormatted = formatTokenCount(parseFloat(dailyPool) / 1e18);

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
              {language === 'en' ? 'ACTIVATION REQUIRED' : '需要激活'}
            </h2>
            <button
              onClick={logout}
              className="text-amber-500/70 hover:text-amber-500 transition-colors"
              title={language === 'en' ? "Disconnect Wallet" : "断开钱包"}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="text-center">
              <p className="text-gray-400 font-mono text-sm leading-relaxed mb-6">
                {language === 'en'
                  ? 'To initiate your survival journey, a one-time activation fee is required.'
                  : '为了开始您的生存之旅，需要支付一次性激活费用。'
                }
              </p>

              {/* Fee Display */}
              <div className="bg-amber-900/10 border border-amber-500/30 p-4 rounded-lg mb-4">
                <p className="text-amber-400 font-mono text-sm mb-1 uppercase tracking-widest opacity-80">
                  {language === 'en' ? 'Activation Fee' : '激活费用'}
                </p>
                <div className="text-3xl font-bold text-white font-mono" style={{ textShadow: '0 0 10px rgba(245, 158, 11, 0.5)' }}>
                  0.015 BNB
                </div>
              </div>

               {/* Daily Pool Estimate */}
               <div className="bg-[#00ff41]/5 border border-[#00ff41]/20 p-4 rounded-lg">
                <p className="text-[#00ff41] font-mono text-xs mb-1 uppercase tracking-widest opacity-80">
                  {language === 'en' ? 'Est. Daily Pool Output' : '预估每日矿池产出'}
                </p>
                <div className="text-2xl font-bold text-[#00ff41] font-mono" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.3)' }}>
                  {dailyPoolFormatted} $Alive
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
                ? (language === 'en' ? 'Processing...' : '处理中...')
                : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {language === 'en' ? 'Pay & Activate' : '支付并激活'}
                  </>
                )
              }
            </button>
            
            <div className="space-y-2">
              <p className="text-center text-gray-600 text-xs font-mono">
                {language === 'en' 
                  ? 'One-time payment only' 
                  : '仅有这一次收费'
                }
              </p>

              {/* Referrer Info */}
              {inviteCode && (
                <p className="text-center text-gray-500 text-[10px] font-mono border-t border-gray-800 pt-2 mt-2">
                  {language === 'en' 
                    ? `Your referrer is ${inviteCode}` 
                    : `你的推荐人是 ${inviteCode}`
                  }
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
}
