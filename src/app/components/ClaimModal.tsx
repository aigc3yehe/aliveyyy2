import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, Twitter } from 'lucide-react';
import { useGameStore } from '@/app/stores/useGameStore';
import { toast } from 'sonner';
import { formatTokenCount } from '@/utils/format';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useWalletClient } from 'wagmi';

interface ClaimRecordDto {
  id: string;
  nonce: string;
  amount: string;
}

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingClaim: ClaimRecordDto | undefined;
}

export function ClaimModal({ isOpen, onClose, pendingClaim }: ClaimModalProps) {
  const { claimable, dopamineIndex, claimRewards, language } = useGameStore(); // userNonce removed as not used directly here anymore
  const { t } = useTranslation();
  const [claimState, setClaimState] = useState<'initial' | 'loading' | 'success'>('initial');
  const [claimedAmount, setClaimedAmount] = useState(0);

  // pendingClaim passed from parent
  const pendingClaimAmount = pendingClaim?.amount ? parseFloat(pendingClaim.amount) / 1e18 : 0;

  // Total display amount: Current accrued (claimable) + Pending claim (from nonce)
  const totalDisplayAmount = claimable + pendingClaimAmount;

  const { data: walletClient } = useWalletClient();
  const [errorMsg, setErrorMsg] = useState('');

  const handleClaim = async () => {
    if (!walletClient) {
      toast.error('Wallet not connected', { description: 'Please connect your wallet first.' });
      return;
    }

    if (totalDisplayAmount > 0) { // Check against total amount
      setClaimState('loading');
      setErrorMsg('');
      const amount = totalDisplayAmount;

      try {
        const result = await claimRewards(walletClient);
        setClaimedAmount(result.amount);
        setClaimState('success');
        toast.success(t('claim.successToast'), {
          description: t('claim.receivedToast', { amount: formatTokenCount(amount) }),
        });
      } catch (error: any) {
        console.error('Claim failed in modal:', error);
        setClaimState('initial');
        // Nicer error message if user rejected
        const msg = error.details || error.message || 'Unknown error';
        setErrorMsg(msg.includes('User rejected') ? t('claim.rejected') : 'Claim failed. See console.');
        toast.error(t('claim.failedToast'), {
          description: msg.slice(0, 100)
        });
      }
    }
  };

  const handleShare = () => {
    const text = t('claim.shareText', { amount: formatTokenCount(claimedAmount) });
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleClose = () => {
    setClaimState('initial');
    onClose();
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {claimState === 'initial' || claimState === 'loading' ? (
            /* 初始领取弹窗 - 末世科技复古风格 */
            <motion.div
              key="initial-modal"
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] bg-black border-2 border-[#00ff41] z-[101]"
              initial={{ opacity: 0, scale: 0.8, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ duration: 0.3 }}
            >
              {/* 关闭按钮 */}
              <button
                onClick={handleClose}
                className="absolute -top-3 -right-3 bg-black border-2 border-[#00ff41] text-[#00ff41] p-2 hover:bg-[#00ff41] hover:text-black transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* 标题栏 */}
              <div className="bg-[#00ff41] p-3">
                <h2 className="text-black font-mono text-lg font-bold tracking-wider text-center">
                  {'>'} {t('claim.title')}
                </h2>
              </div>

              {/* 内容区域 */}
              <div className="p-6 space-y-6">
                {/* 可领取的$活着呢显示 */}
                <div className="border border-[#00ff41]/30 p-4">
                  <div className="text-gray-400 font-mono text-xs mb-2">
                    [ {t('claim.pendingRewards')} ]
                  </div>
                  <motion.div
                    className={`text-[#00ff41] font-mono font-bold text-center ${pendingClaimAmount > 0 ? 'text-2xl' : 'text-4xl'}`}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {pendingClaimAmount > 0
                      ? `${formatTokenCount(pendingClaimAmount)} + ${formatTokenCount(claimable)}`
                      : formatTokenCount(claimable)
                    }
                  </motion.div>
                  <div className="text-gray-500 font-mono text-sm text-center mt-2">
                    $活着呢
                  </div>
                </div>

                {/* 多巴胺指数警示 */}
                <div className="border border-yellow-500/50 bg-yellow-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-500 text-2xl flex-shrink-0">⚠️</div>
                    <div className="flex-1">
                      <div className="text-yellow-500 font-mono text-xs mb-2">
                        [ {t('claim.dopamineIndex')} ]
                      </div>
                      <motion.div
                        className="text-yellow-400 font-mono text-2xl font-bold mb-2"
                        key={dopamineIndex}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        x{dopamineIndex.toFixed(1)}
                      </motion.div>
                      <div className="text-gray-400 font-mono text-xs leading-relaxed">
                        {t('claim.warningreset')}
                        <br />
                        {t('claim.warningdelay')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 领取按钮 */}
                <motion.button
                  onClick={handleClaim}
                  disabled={totalDisplayAmount <= 0 || claimState === 'loading'}
                  className="w-full bg-black border-2 border-[#00ff41] text-[#00ff41] py-4 font-mono text-lg font-bold hover:bg-[#00ff41] hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-[#00ff41] relative flex flex-col items-center justify-center"
                  whileHover={totalDisplayAmount > 0 ? { scale: 1.02 } : {}}
                  whileTap={totalDisplayAmount > 0 && claimState !== 'loading' ? { scale: 0.98 } : {}}
                >
                  {claimState === 'loading' ? (
                    <span className="animate-pulse">{t('claim.button.claiming')}</span>
                  ) : (
                    pendingClaimAmount > 0 ? (
                      t('claim.button.continue')
                    ) : (
                      t('claim.button.default')
                    )
                  )}

                  {pendingClaimAmount > 0 && (
                    <div className="font-mono text-[10px] text-gray-500 mt-1">
                      {t('claim.comingSoon', { amount: formatTokenCount(pendingClaimAmount) })}
                    </div>
                  )}
                </motion.button>

                {errorMsg && (
                  <div className="text-red-500 font-mono text-xs text-center mt-2 break-all px-2">
                    {errorMsg}
                  </div>
                )}

                {/* 底部提示 */}
                <div className="border-t border-[#00ff41]/20 pt-4">
                  <p className="text-gray-600 font-mono text-xs text-center mt-1">
                    {t('claim.tip')}
                  </p>
                </div>
              </div>

              {/* CRT 扫描线效果 */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.03) 2px, rgba(0, 255, 65, 0.03) 4px)',
                }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </motion.div>
          ) : (
            /* 成功分享弹窗 - 绿色生存风格 */
            <motion.div
              key="success-modal"
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] bg-[#001a05] border-4 border-[#00ff41] rounded-xl z-[101] overflow-hidden"
              initial={{ opacity: 0, scale: 0.8, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              {/* 绿色背景光效 */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 animate-pulse" />
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#00ff41] rounded-full blur-[100px] opacity-10" />
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#00ff41] rounded-full blur-[100px] opacity-10" />

              <div className="relative p-8 flex flex-col items-center">
                {/* 成功图标 */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-br from-[#00ff41] to-[#008f11] rounded-full flex items-center justify-center mb-6 border-4 border-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.4)]"
                >
                  <span className="text-4xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">❤️</span>
                </motion.div>

                {/* 标题 */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-[#00ff41] font-bold text-3xl mb-2 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                  style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.4)' }}
                >
                  {t('claim.successTitle')}
                </motion.h2>

                {/* 获得金额 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="mb-8 text-center"
                >
                  <p className="text-[#00ff41]/80 text-sm mb-2 font-mono">
                    {t('claim.received')}
                  </p>
                  <div className="text-5xl font-bold text-white mb-2 drop-shadow-[0_4px_0_rgba(0,100,25,0.8)]" style={{ fontFamily: 'Arial, sans-serif' }}>
                    {formatTokenCount(claimedAmount)}
                  </div>
                  <p className="text-[#00ff41] font-mono text-lg font-bold">
                    $活着呢
                  </p>
                </motion.div>

                {/* 分享按钮 (Share on X) */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  onClick={handleShare}
                  className="w-full bg-black text-[#00ff41] border border-[#00ff41] py-4 rounded-xl font-bold text-lg mb-4 flex items-center justify-center gap-2 hover:bg-[#00ff41] hover:text-black transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(0,255,65,0.2)]"
                >
                  <Twitter className="w-5 h-5" />
                  {t('claim.share')}
                </motion.button>

                {/* 稍后分享按钮 (Close) */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  onClick={handleClose}
                  className="text-[#00ff41]/50 hover:text-[#00ff41] font-mono text-sm transition-colors"
                >
                  {t('claim.shareLater')}
                </motion.button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}