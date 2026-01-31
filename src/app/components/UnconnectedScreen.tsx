import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import useSWR from 'swr';
import { api, fetcher } from '@/services/api';
import { DashboardSummaryResponse } from '@/app/stores/useGameStore';
import { formatTokenCount } from '@/utils/format';
import { useTranslation } from 'react-i18next';

interface UnconnectedScreenProps {
  onLogin?: () => void;
}

export function UnconnectedScreen({ onLogin }: UnconnectedScreenProps) {
  const { t } = useTranslation();
  const { data: globalStats } = useSWR<DashboardSummaryResponse>('/dashboard/summary', fetcher, {
    refreshInterval: 30000
  });

  // Default fallback if loading
  const stats = globalStats ? {
    alivePlayers: globalStats.aliveUsers,
    todayPool: parseFloat(globalStats.dailyPoolTotal) / 1e18,
    todayDead: globalStats.disconnectedUsers,
  } : {
    alivePlayers: 0,
    todayPool: 0,
    todayDead: 0,
  };

  return (
    <div className="absolute inset-0 z-40">
      {/* TV噪点层 */}
      <motion.div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
        animate={{
          opacity: [0.1, 0.25, 0.15, 0.2],
        }}
        transition={{
          duration: 0.15,
          repeat: Infinity,
        }}
      />

      {/* Glitch闪烁效果 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-blue-500/10 pointer-events-none"
        animate={{
          opacity: [0, 0.2, 0, 0, 0, 0.3, 0],
          x: [0, -5, 5, 0, 0, 3, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          times: [0, 0.1, 0.2, 0.3, 0.7, 0.8, 1],
        }}
      />

      {/* 中央登录框 */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <motion.div
          className="w-full max-w-md bg-black border-4 border-[#00ff41] shadow-2xl relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            boxShadow: '0 0 40px rgba(0, 255, 65, 0.3), inset 0 0 20px rgba(0, 255, 65, 0.1)',
          }}
        >
          {/* 顶部标题条 */}
          <motion.div
            className="bg-gradient-to-r from-[#00ff41] via-[#00d636] to-[#00ff41] px-4 py-3 flex items-center justify-center gap-2 relative overflow-hidden"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              backgroundSize: '200% 100%',
            }}
          >
            {/* 扫描线效果 */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                width: '50%',
              }}
            />
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              🔗
            </motion.div>
            <motion.h2
              className="text-black font-mono text-lg md:text-xl font-bold tracking-widest relative z-10"
              animate={{
                textShadow: [
                  '0 0 10px rgba(0,0,0,0.5)',
                  '0 0 20px rgba(0,0,0,0.3)',
                  '0 0 10px rgba(0,0,0,0.5)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              {t('unconnected.readyToConnect')}
            </motion.h2>
          </motion.div>

          {/* 主内容区域 */}
          <div className="p-6 md:p-8 space-y-6">
            {/* 副标题 */}
            <div className="text-center space-y-2">
              <p className="text-[#00ff41] font-mono text-base md:text-lg leading-relaxed">
                {t('unconnected.startProtocol')}
              </p>
            </div>

            {/* 连接按钮 */}
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                  ready &&
                  account &&
                  chain &&
                  authenticationStatus === 'authenticated';

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      'style': {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <motion.button
                            onClick={() => {
                              if (account && onLogin) {
                                onLogin();
                              } else {
                                openConnectModal();
                              }
                            }}
                            className="w-full bg-gradient-to-br from-[#00ff41] via-[#00d636] to-[#00cc33] border-2 border-[#00ff41] text-black py-4 md:py-5 font-mono text-lg md:text-xl font-bold relative overflow-hidden group shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                              boxShadow: '0 0 30px rgba(0, 255, 65, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            {/* 呼吸灯效果 */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                              animate={{
                                x: ['-200%', '200%'],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                            />
                            {/* 脉冲光晕 */}
                            <motion.div
                              className="absolute inset-0 bg-[#00ff41]"
                              animate={{
                                opacity: [0.2, 0.5, 0.2],
                                scale: [1, 1.05, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            />
                            <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-lg">
                              <motion.div
                                animate={{
                                  rotate: [0, 360],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: 'linear',
                                }}
                              >
                                🔓
                              </motion.div>
                              {t('unconnected.connectWallet')}
                            </span>
                          </motion.button>
                        );
                      }
                      return null; // Should not happen in UnconnectedScreen, but good practice
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>

            {/* 全网数据展示 */}
            <div className="border-t-2 border-gray-800 pt-6 space-y-3">
              <p className="text-gray-500 font-mono text-xs text-center mb-4">
                {t('unconnected.globalStatsRealtime')}
              </p>

              <div className="grid grid-cols-1 gap-3">
                {/* 存活玩家 */}
                <motion.div
                  className="bg-gray-900/50 border border-green-500/30 p-3 flex items-center justify-between"
                  animate={{
                    borderColor: ['rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.6)', 'rgba(34, 197, 94, 0.3)'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <span className="text-gray-400 font-mono text-xs md:text-sm">
                    {t('unconnected.alivePlayers')}
                  </span>
                  <motion.span
                    className="text-green-400 font-mono text-lg md:text-xl font-bold"
                    key={stats.alivePlayers}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                  >
                    {stats.alivePlayers.toLocaleString()}
                  </motion.span>
                </motion.div>

                {/* [HIDDEN] 今日奖池
                <div className="bg-gray-900/50 border border-yellow-500/30 p-3 flex items-center justify-between">
                  <span className="text-gray-400 font-mono text-xs md:text-sm">
                    {t('unconnected.todaysPrizePool')}
                  </span>
                  <span className="text-yellow-400 font-mono text-lg md:text-xl font-bold">
                    {formatTokenCount(stats.todayPool)}
                  </span>
                </div>
                */}

                {/* 今日阵亡 */}
                <motion.div
                  className="bg-gray-900/50 border border-red-500/30 p-3 flex items-center justify-between"
                  animate={{
                    borderColor: ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.6)', 'rgba(239, 68, 68, 0.3)'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <span className="text-gray-400 font-mono text-xs md:text-sm">
                    {t('unconnected.todaysLostContact')}
                  </span>
                  <motion.span
                    className="text-red-400 font-mono text-lg md:text-xl font-bold"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    {stats.todayDead}
                  </motion.span>
                </motion.div>
              </div>
            </div>

            {/* 底部提示 */}
            <div className="border-t border-gray-800 pt-4">
              <p className="text-gray-600 font-mono text-xs text-center leading-relaxed">
                {t('unconnected.livesLost')}
              </p>
            </div>
          </div>

          {/* CRT扫描线 */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 0, 0, 0.05) 2px, rgba(255, 0, 0, 0.05) 4px)',
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
      </div>
    </div>
  );
}