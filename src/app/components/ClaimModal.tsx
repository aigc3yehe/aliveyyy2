import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useGameStore } from '@/app/stores/useGameStore';
import { toast } from 'sonner';
import { formatTokenCount } from '@/utils/format';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClaimModal({ isOpen, onClose }: ClaimModalProps) {
  const { pendingAlive, dopamineIndex, claimAlive, language } = useGameStore();

  const handleClaim = () => {
    if (pendingAlive > 0) {
      claimAlive();
      toast.success('领取成功！', {
        description: `获得 ${formatTokenCount(pendingAlive)} $活着呢`,
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 弹窗内容 - 末世科技复古风格 */}
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] bg-black border-2 border-[#00ff41] z-[101]"
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute -top-3 -right-3 bg-black border-2 border-[#00ff41] text-[#00ff41] p-2 hover:bg-[#00ff41] hover:text-black transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 标题栏 */}
            <div className="bg-[#00ff41] p-3">
              <h2 className="text-black font-mono text-lg font-bold tracking-wider text-center">
                {'>'} CLAIM_TOKENS
              </h2>
            </div>

            {/* 内容区域 */}
            <div className="p-6 space-y-6">
              {/* 可领取的$ALIVE显示 */}
              <div className="border border-[#00ff41]/30 p-4">
                <div className="text-gray-400 font-mono text-xs mb-2">
                  [ PENDING_REWARDS ]
                </div>
                <motion.div
                  className="text-[#00ff41] font-mono text-4xl font-bold text-center"
                  key={pendingAlive}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {formatTokenCount(pendingAlive)}
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
                      [ DOPAMINE_INDEX ]
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
                      {language === 'en' ? (
                        <>
                          // WARNING: Claiming tokens resets Dopamine Index
                          <br />
                          // Restraint and delayed gratification yield higher rewards
                        </>
                      ) : (
                        <>
                          // 警告：领取代币将重置多巴胺指数
                          <br />
                          // 保持克制，延迟满足感可获得更高收益
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 领取按钮 */}
              <motion.button
                onClick={handleClaim}
                disabled={pendingAlive <= 0}
                className="w-full bg-black border-2 border-[#00ff41] text-[#00ff41] py-4 font-mono text-lg font-bold hover:bg-[#00ff41] hover:text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-[#00ff41]"
                whileHover={pendingAlive > 0 ? { scale: 1.02 } : {}}
                whileTap={pendingAlive > 0 ? { scale: 0.98 } : {}}
              >
                [ CLAIM_NOW ]
              </motion.button>

              {/* 底部提示 */}
              <div className="border-t border-[#00ff41]/20 pt-4">
                <p className="text-gray-600 font-mono text-xs text-center mt-1">
                  // {language === 'en' ? 'Higher Dopamine Index means earning $Alive faster' : '多巴胺指数越高，越能快速获得 $活着呢'}
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
        </>
      )}
    </AnimatePresence>
  );
}