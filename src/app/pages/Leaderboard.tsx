import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Link } from 'react-router';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useGameStore, LeaderboardEntry } from '@/app/stores/useGameStore';
import { useUserGameData } from '@/app/hooks/useUserGameData';
import { fetcher } from '@/services/api';
import imgFe494Eac1A744C06A8Dd40208Ae38Bdf5 from '@/assets/931f8f55564bd4e3bd95cdb7a89980e1a1c18de7.webp';
import { formatTokenCount } from '@/utils/format';

interface LeaderboardDisplayItem {
  rank: number;
  address: string;
  hp: number;
  streaks: number;
  bonus: number;
  avatar: string;
}

export default function Leaderboard() {
  const { address } = useAccount();
  const { hp, streaks, survivalMultiplier, language } = useGameStore();

  // Use new SWR hook for user data syncing
  useUserGameData(address);

  // Use SWR for fetching leaderboard
  const { data: rawLeaderboardData } = useSWR<LeaderboardEntry[]>('/dashboard/leaderboard?sortBy=rewardWeight', fetcher);

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardDisplayItem[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Dummy Invite Data
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

  useEffect(() => {
    if (rawLeaderboardData) {
      const mappedData = rawLeaderboardData.map((entry, index) => ({
        rank: index + 1,
        address: entry.address,
        hp: entry.hp,
        streaks: entry.consecutiveCheckinDays,
        bonus: entry.multiplier,
        avatar: index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'
      }));
      setLeaderboardData(mappedData);
    }
  }, [rawLeaderboardData]);

  // CRT 扫描线效果
  const scanlineEffect = (
    <motion.div
      className="absolute inset-0 pointer-events-none z-50"
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
  );

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black">
      {/* 桌面端无缝贴图背景 - 只在大屏幕显示 */}
      <div
        className="hidden md:block absolute inset-0"
        style={{
          backgroundImage: `url(${imgFe494Eac1A744C06A8Dd40208Ae38Bdf5})`,
          backgroundSize: '480px 860px',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
        }}
      />

      {/* 桌面端暗色遮罩 */}
      <div className="hidden md:block absolute inset-0 bg-black/60" />

      {/* 桌面端：9:16居中容器 | 移动端：全屏 */}
      <div className="absolute inset-0 md:flex md:items-center md:justify-center md:p-5">
        <motion.div
          className="relative w-full h-full md:w-auto md:h-[calc(100vh-80px)] md:rounded-[24px] md:shadow-2xl overflow-hidden bg-black"
          style={{
            aspectRatio: window.innerWidth >= 768 ? '9 / 16' : undefined,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* 内容容器 - 可滚动 */}
          <div className="relative w-full h-full overflow-y-auto">
            {/* 返回按钮 - 固定在左上角 */}
            <Link to="/">
              <motion.button
                className="fixed top-6 left-6 z-50 flex items-center gap-2 bg-black/80 border border-[#00ff41] px-4 py-2 backdrop-blur-sm"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(0, 255, 65, 0.1)' }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-[#00ff41]" />
                <span className="text-[#00ff41] font-mono text-sm">
                  {language === 'en' ? 'RETURN' : '返回游戏'}
                </span>
              </motion.button>
            </Link>

            {/* 主要内容区域 */}
            <div className="pt-24 pb-8 px-6">
              {/* 终端风格标题 */}
              <div className="mb-8">
                <motion.div
                  className="border-l-4 border-[#00ff41] pl-4 mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-[#00ff41] font-mono text-3xl mb-2 tracking-wider">
                    {'>'} {language === 'en' ? 'SURVIVOR_RANKING' : '生存者排行榜'}
                  </h1>
                  <p className="text-gray-400 font-mono text-sm">
                    // {language === 'en' ? 'ULTIMATE SURVIVOR DATABASE' : '最强生存者数据库'}
                  </p>
                </motion.div>

                {/* 你的状态 - 终端风格 */}
                <motion.div
                  className="bg-black border border-[#00ff41] p-4 font-mono mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="text-gray-400 text-xs mb-2">
                    [ {language === 'en' ? 'YOUR_STATUS' : '你的状态'} ]
                  </div>
                  {/* Status Grid - Back to 3 columns */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">HP:</div>
                      <motion.div
                        className="text-[#00ff41] text-lg font-bold"
                        key={hp}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {hp}/48
                      </motion.div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        {language === 'en' ? 'STREAK:' : '天数:'}
                      </div>
                      <motion.div
                        className="text-[#00ff41] text-lg font-bold"
                        key={streaks}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {streaks}D
                      </motion.div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        {language === 'en' ? 'BONUS:' : '加成:'}
                      </div>
                      <motion.div
                        className="text-[#00ff41] text-lg font-bold"
                        key={survivalMultiplier}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        x{survivalMultiplier.toFixed(2)}
                      </motion.div>
                    </div>
                  </div>

                  {/* Separated Invite Section */}
                  <div 
                    onClick={() => setShowInviteModal(true)}
                    className="relative cursor-pointer group bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30 p-3 rounded-lg flex items-center justify-between hover:border-amber-500/60 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                        <span className="text-xl">👑</span>
                      </div>
                      <div>
                        <div className="text-amber-500/80 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                          {language === 'en' ? 'Total Invites' : '累计邀请'}
                        </div>
                        <motion.div
                          className="text-amber-400 text-xl font-bold font-mono leading-none"
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          12
                        </motion.div>
                      </div>
                    </div>
                    
                    {/* Arrow Indicator */}
                    <div className="text-amber-500/50 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">
                      <span className="font-mono text-xl">{'>'}</span>
                    </div>

                    {/* Scanline overlay for this block */}
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-5 rounded-lg"
                      style={{
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(245, 158, 11, 0.2) 2px, rgba(245, 158, 11, 0.2) 4px)',
                      }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* 排行榜表格 - 终端风格 */}
              <div className="border border-[#00ff41]/30 overflow-hidden">
                {/* 表头 */}
                <div className="grid grid-cols-5 gap-2 p-3 bg-black border-b border-[#00ff41]/30">
                  <div className="text-[#00ff41] font-mono text-xs">#</div>
                  <div className="text-[#00ff41] font-mono text-xs">
                    {language === 'en' ? 'ADDRESS' : '地址'}
                  </div>
                  <div className="text-[#00ff41] font-mono text-xs text-center">HP</div>
                  <div className="text-[#00ff41] font-mono text-xs text-center">
                    {language === 'en' ? 'DAYS' : '天数'}
                  </div>
                  <div className="text-[#00ff41] font-mono text-xs text-right">
                    {language === 'en' ? 'BONUS' : '加成'}
                  </div>
                </div>

                {/* 排行榜数据 */}
                {leaderboardData.map((player, index) => (
                  <motion.div
                    key={player.rank}
                    className="grid grid-cols-5 gap-2 p-3 border-b border-[#00ff41]/10 hover:bg-[#00ff41]/5 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* 排名 */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{player.avatar}</span>
                      <span className="text-gray-400 font-mono text-xs">{player.rank}</span>
                    </div>

                    {/* 地址 */}
                    <div className="flex items-center">
                      <span className="text-gray-300 font-mono text-xs truncate">
                        {`${player.address.slice(0, 5)}...${player.address.slice(-3)}`}
                      </span>
                    </div>

                    {/* HP */}
                    <div className="flex items-center justify-center">
                      <span
                        className={`font-mono text-xs font-bold ${player.hp >= 45 ? 'text-[#00ff41]' : 'text-yellow-500'
                          }`}
                      >
                        {player.hp}/48
                      </span>
                    </div>

                    {/* 连续天数 */}
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3 text-[#00ff41]" />
                      <span className="text-gray-300 font-mono text-xs font-bold">
                        {player.streaks}
                      </span>
                    </div>

                    {/* $活着呢 */}
                    <div className="flex items-center justify-end">
                      <span className="text-white font-mono text-xs font-bold">
                        x{player.bonus.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 底部提示信息 */}
              <motion.div
                className="mt-8 border-t border-[#00ff41]/20 pt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >

                <p className="text-gray-600 font-mono text-xs text-center mt-1">
                  // {language === 'en' ? 'Maintain streak to rank up' : '保持连续签到以提升排名'}
                </p>

              </motion.div>
            </div>
          </div>

          {/* CRT 扫描线效果 */}
          {scanlineEffect}
        </motion.div>
      </div>

       {/* Invite Details Modal */}
       {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowInviteModal(false)}
          />
          <motion.div
            className="relative w-full max-w-sm bg-black border border-[#00ff41] shadow-[0_0_30px_rgba(0,255,65,0.2)] rounded-lg overflow-hidden flex flex-col max-h-[80vh]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-[#00ff41]/30 flex items-center justify-between bg-[#00ff41]/5">
              <h3 className="text-[#00ff41] font-mono text-lg font-bold">
                {language === 'en' ? 'INVITATION LOG' : '邀请记录'}
              </h3>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="text-[#00ff41]/70 hover:text-[#00ff41]"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#00ff41]/20 scrollbar-track-transparent">
              <div className="grid grid-cols-2 gap-2 px-2 py-2 text-xs text-gray-500 font-mono border-b border-[#00ff41]/10 mb-2">
                <div>{language === 'en' ? 'USER' : '用户'}</div>
                <div className="text-right">{language === 'en' ? 'INVITED' : '已邀请'}</div>
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
                  ? 'Each direct invite adds 0.1 Dopamine Index. Indirect invites add 0.01.' 
                  : '每增加一个被邀请人，多巴胺系数增加0.1，被邀请人的邀请数量将给你增加0.01多巴胺系数'}
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
    </div>
  );
}
