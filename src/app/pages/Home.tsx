import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useEffect, useState, useRef } from 'react';
import svgPaths from '@/imports/svg-5a80hypqpv';
import imgFe494Eac1A744C06A8Dd40208Ae38Bdf5 from '@/assets/931f8f55564bd4e3bd95cdb7a89980e1a1c18de7.webp';
import imgBg from '@/assets/dca99f7bd6ea1c0f2b1a15f76d3e0bba21ec1e4d.webp';
// Game Background Layers (from top/front to bottom/back)
import imgLayerStove from '@/assets/stove_compressed.webp';
import imgLayerBad from '@/assets/bad_compressed.webp';
import imgLayerBedDoll from '@/assets/fk00_compressed.webp';
import imgLayerBedFk01 from '@/assets/fk01_compressed.webp';
import imgLayerBedFk02 from '@/assets/fk02_compressed.webp';
import imgLayerPlayer from '@/assets/player_compressed.webp';
import imgLayerPlayer2 from '@/assets/player2_compressed.webp';
import imgLayerPlayerDef from '@/assets/playerdef_compressed.webp';
import imgLayerPlayer03 from '@/assets/player03_compressed.webp';
import imgLayerPlayer04 from '@/assets/player04_compressed.webp';
import imgLayerPlayer05 from '@/assets/player05_compressed.webp';
import imgLayerDeadman from '@/assets/deadman_compressed.webp';
import imgLayerPhoto from '@/assets/photo_compressed.webp';
import imgLayerHolographic from '@/assets/Holographic display_compressed.webp';
import imgLayerTotalBg from '@/assets/total_bg_compressed.webp';
import imgAliveBtn from '@/assets/fd492cf3478c581e2ebbfb59ed8c4aa19c961a66.webp';
import imgStoreBtn from '@/assets/c295b3b73b51e093b63ff0a1d6a381dfcbc47839.webp';
import imgHeartMonitor from '@/assets/9d6d0e35bac475838303aad4de9c9b50d0be0176.webp';
import imgHeartBtnBg from '@/assets/bd95fee5e21f1697afb011ffa1c5e5756804bfc6.webp';
import imgHeartBtn from '@/assets/336cb1ad470709b7da3a846b993fc5d47ddbebb7.webp';
import imgHeartBtn1 from '@/assets/68435f1d5091d26adec7c518081a885e850d4cad.webp';
import imgHeartBtn2 from '@/assets/384a51cade3fbca94390d4d3a08e842c3847600c.webp';
import imgHealth from '@/assets/healthbar_compressed.webp';
import { useGameStore } from '@/app/stores/useGameStore';
import { useDecorationStore } from '@/app/stores/useDecorationStore';
import { useGameLoop } from '@/app/hooks/useGameLoop';
import { toast } from 'sonner';
import { AliveTokenDisplay } from '@/app/components/AliveTokenDisplay';
import { ClaimModal } from '@/app/components/ClaimModal';
import { StatsIndicators } from '@/app/components/StatsIndicators';
import { UnconnectedScreen } from '@/app/components/UnconnectedScreen';
import { DevControlPanel } from '@/app/components/DevControlPanel';
import { SoundManager } from '@/app/components/SoundManager';
import { useSound } from '@/app/hooks/useSound';
import { Volume2, Volume1, VolumeX, LogOut, Lock, HelpCircle } from 'lucide-react';
import { InfoModal } from '@/app/components/InfoModal';

import soundLogin from '@/assets/login.mp3';
import soundHeart01 from '@/assets/heart01.mp3';
import soundHeart02 from '@/assets/heart02.mp3';
import soundHeart03 from '@/assets/heart03.mp3';
import soundToken from '@/assets/tokensound.mp3';
import soundCoin from '@/assets/coin.mp3';
import soundFart from '@/assets/fart.mp3';
import soundTyping from '@/assets/typing.mp3';
import soundYawning from '@/assets/yawning.mp3';



// Decoration asset mapping (includes animation frame assets)
const DECORATION_ASSETS: Record<string, Record<string, string>> = {
  background: {
    default: imgLayerTotalBg,
  },
  holographic: {
    default: imgLayerHolographic,
  },
  photo: {
    default: imgLayerPhoto,
  },
    player: {
    default: imgLayerPlayer,
    player2: imgLayerPlayer2,
    playerdef: imgLayerPlayerDef,
    player03: imgLayerPlayer03,
    player04: imgLayerPlayer04,
    player05: imgLayerPlayer05,
    deadman: imgLayerDeadman,
  },
  bed: {
    default: imgLayerBad,
    doll: imgLayerBedDoll,
    fk01: imgLayerBedFk01,
    fk02: imgLayerBedFk02,
  },
  stove: {
    default: imgLayerStove,
  },
};

export default function Home() {
  const navigate = useNavigate();
  const { hp, maxHp, aliveBalance, isAlive, streaks, survivalMultiplier, dopamineIndex, isConnected, audioState, language, checkIn, setIsConnected, cycleAudioState, setLanguage, walletAddress } = useGameStore();
  const { config: decorationConfig, isLoading: isDecorationLoading, fetchDecorations, layerOverrides, handleLayerClick, setLayerOverride, clearLayerOverride } = useDecorationStore();
  const [bottomScale, setBottomScale] = useState(1);
  const [topScale, setTopScale] = useState(1);
  const [currentHeartImg, setCurrentHeartImg] = useState(imgHeartBtn);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [showHeartbeatEffect, setShowHeartbeatEffect] = useState(false);
  const [isLostContactDismissed, setIsLostContactDismissed] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const playSound = useSound();
  
  useGameLoop();

  // Load decorations on mount
  useEffect(() => {
    fetchDecorations();
  }, [fetchDecorations]);

  // Login Sound Effect
  useEffect(() => {
    if (isConnected) {
      playSound(soundLogin);
    }
  }, [isConnected, playSound]);

  // Reset dismissed state when player revives
  useEffect(() => {
    if (isAlive) {
      setIsLostContactDismissed(false);
    }
  }, [isAlive]);

  // 计算缩放比例 - 基于实际容器宽度
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // 设计宽度505px
        const designWidth = 505;
        
        if (containerWidth !== designWidth) {
          // Calculate scale ratio based on container width vs design width
          // Allow scale > 1 for large screens, and scale < 1 for small mobile screens
          const scale = containerWidth / designWidth; 
          setBottomScale(scale);
          setTopScale(scale);
        } else {
          setBottomScale(1);
          setTopScale(1);
        }
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    // 使用timeout确保容器已经渲染
    const timer = setTimeout(updateScale, 100);
    
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timer);
    };
  }, []);

  // Random Floating Text Effect
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const spawnText = () => {
      // Random interval between 3.2s (3200ms) and 16s (16000ms) (Original 2s-10s + 60%)
      const interval = Math.random() * 12800 + 3200;
      
      timeoutId = setTimeout(() => {
        if (isConnected && isAlive) {
           const id = Date.now();
           // Random position in full effective area
           // Left: 10% - 90%, Top: 10% - 90% (relative to container)
           const x = 10 + Math.random() * 80; 
           const y = 10 + Math.random() * 80;

           setFloatingTexts(prev => [...prev, { id, x, y }]);
           playSound(soundCoin);

           // Auto remove after animation
           setTimeout(() => {
             setFloatingTexts(prev => prev.filter(item => item.id !== id));
           }, 2000);
        }
        spawnText(); // Schedule next
      }, interval);
    };

    spawnText();

    return () => clearTimeout(timeoutId);
  }, [isConnected, isAlive, playSound]);

  // Random Events System (Abstracted)
  useEffect(() => {
    if (!isConnected || !isAlive) return;

    const checkRandomEvents = () => {
       // Combined Random Event (30% chance every 15s)
       // Play sound AND switch player image simultaneously
       if (Math.random() < 0.3) {
          // 1. Play Sound
          const sounds = [soundFart, soundTyping, soundYawning];
          const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
          playSound(randomSound);

          // 2. Switch Player Image
          // Use KEYS from DECORATION_ASSETS.player, not the image objects themselves
          const playerKeys = ['player2', 'playerdef', 'player03', 'player04', 'player05'];
          const randomKey = playerKeys[Math.floor(Math.random() * playerKeys.length)];
          
          setLayerOverride('player', randomKey);
          
          // Switch back after 3 seconds
          setTimeout(() => {
            clearLayerOverride('player');
          }, 3000);
       }
    };

    const timer = setInterval(checkRandomEvents, 15000); 
    
    // Initial check (optional, let's wait for interval)
    
    return () => clearInterval(timer);
  }, [isConnected, isAlive, playSound, setLayerOverride, clearLayerOverride]);

  const handleCheckIn = () => {
    // Play random heart sound
    const heartSounds = [soundHeart01, soundHeart02, soundHeart03];
    const randomSound = heartSounds[Math.floor(Math.random() * heartSounds.length)];
    playSound(randomSound);

    // 触发心跳动画效果
    setShowHeartbeatEffect(true);
    setTimeout(() => setShowHeartbeatEffect(false), 1500);

    // 随机切换心脏图片
    const heartImages = [imgHeartBtn1, imgHeartBtn2];
    const randomHeart = heartImages[Math.floor(Math.random() * heartImages.length)];
    setCurrentHeartImg(randomHeart);
    
    // 300ms后恢复默认图片
    setTimeout(() => {
      setCurrentHeartImg(imgHeartBtn);
    }, 300);

    // Always allow check-ins, even if fully healed (for streaks/tokens) or dead (for revival)
    checkIn();

    if (hp < maxHp) {
       toast.success(language === 'en' ? 'Check-in successful! HP +1' : '签到/复活成功！HP +1', {
         description: `${language === 'en' ? 'Current HP' : '当前HP'}: ${Math.min(maxHp, hp + 1)}/${maxHp}`,
       });
    } else {
      // HP已满，只显示提示
      toast.success(language === 'en' ? 'HP Full! Tokens Earned' : 'HP已满！获得Token奖励', {
        description: `${language === 'en' ? 'Current HP' : '当前HP'}: ${hp}/${maxHp}`,
      });
    }
  };

  // CRT 扫描线效果
  const scanlineEffect = (
    <motion.div
      className="absolute inset-0 pointer-events-none z-50"
      style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
      }}
      animate={{
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );

  // 计算HP百分比
  const hpPercentage = (hp / maxHp) * 100;

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

      {/* 失联模式全屏滤镜/弹窗 - 仅在未Dismiss时显示 */}
      {!isAlive && !isLostContactDismissed && (
        <motion.div
          className="absolute inset-0 bg-gray-900/90 z-50 flex items-center justify-center p-4"
          style={{
            backdropFilter: 'grayscale(100%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="w-full max-w-md text-center">
            <motion.div
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <motion.p
                className="text-red-500 text-4xl md:text-5xl font-bold mb-4 tracking-widest"
                animate={{
                  opacity: [1, 0.6, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                {language === 'en' ? 'CONNECTION LOST' : '信号丢失'}
              </motion.p>
              
              <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-8 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <p className="text-white text-xl font-bold mb-6">
                  {language === 'en' ? 'Vital Signs Lost' : '检测到生命体征消失'}
                </p>
                <div className="space-y-4 text-gray-300 mb-8">
                  <p>
                    {language === 'en' 
                      ? 'Please continue pressing the HEART button to activate/accumulate Tokens.' 
                      : '请持续按压心脏以激活/积累Token'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {language === 'en'
                      ? 'Manual CPR can restore HP.'
                      : '持续手动按压可恢复生命值'}
                  </p>
                </div>
                
                <motion.button
                  onClick={() => setIsLostContactDismissed(true)}
                  className="w-full bg-stone-800 hover:bg-stone-700 text-white py-4 rounded-xl font-bold tracking-wide transition-colors border border-stone-600"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {language === 'en' ? 'I UNDERSTAND' : '我知道了'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* 桌面端：9:16居中容器 | 移动端：全屏 */}
      <div className="absolute inset-0 md:flex md:items-center md:justify-center md:p-5">
        <motion.div
          ref={containerRef}
          className="relative w-full h-full md:w-auto md:h-[calc(100vh-80px)] md:rounded-[24px] md:shadow-2xl overflow-hidden"
          style={{
            aspectRatio: window.innerWidth >= 768 ? '9 / 16' : undefined,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
              {/* 房间背景 - 分层渲染，无论生死都渲染，死时显示deadman */}
              <div className="absolute inset-0">
                {/* Loading skeleton */}
                {isDecorationLoading && (
                  <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center z-10">
                    <div className="w-12 h-12 border-4 border-[#00ff41]/30 border-t-[#00ff41] rounded-full animate-spin" />
                  </div>
                )}
                
                {/* Layer 6: 最底层背景 (total_bg) */}
                <img 
                  src={DECORATION_ASSETS.background[isAlive ? (layerOverrides.background || decorationConfig.background) : 'default']} 
                  alt="Background" 
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: isConnected ? 'none' : 'brightness(0.5) blur(4px)' }}
                />
                {/* Layer 5: 全息显示屏 (Holographic display) - with breathing cyan glow */}
                <img 
                  src={DECORATION_ASSETS.holographic[isAlive ? (layerOverrides.holographic || decorationConfig.holographic) : 'default']} 
                  alt="Holographic Display" 
                  className="absolute inset-0 w-full h-full object-cover animate-holographic-glow"
                  style={{ 
                    filter: isConnected ? 'none' : 'brightness(0.5) blur(4px)',
                  }}
                />
                {/* Layer 4: 照片 (photo) */}
                <img 
                  src={DECORATION_ASSETS.photo[isAlive ? (layerOverrides.photo || decorationConfig.photo) : 'default']} 
                  alt="Photo" 
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: isConnected ? 'none' : 'brightness(0.5) blur(4px)' }}
                />
                {/* Layer 3: 玩家 (player) */}
                <img 
                  src={DECORATION_ASSETS.player[isAlive ? (layerOverrides.player || decorationConfig.player) : 'deadman']} 
                  alt="Player" 
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{ filter: isConnected ? 'none' : 'brightness(0.5) blur(4px)' }}
                />
                {/* Layer 2: 床 (bed) */}
                <img 
                  src={DECORATION_ASSETS.bed[isAlive ? (layerOverrides.bed || decorationConfig.bed) : 'default']} 
                  alt="Bed" 
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{ filter: isConnected ? 'none' : 'brightness(0.5) blur(4px)' }}
                />
                {/* Layer 1: 最顶层炉子 (stove) */}
                <img 
                  src={DECORATION_ASSETS.stove[isAlive ? (layerOverrides.stove || decorationConfig.stove) : 'default']} 
                  alt="Stove" 
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{ filter: isConnected ? 'none' : 'brightness(0.5) blur(4px)' }}
                />
                
                {/* Interaction Click Zones (z-20) */}
                <div className="absolute inset-0 z-20">
                  {/* Bed Click Zone: Left 50%, Bottom 66% */}
                  <div 
                    className="absolute left-0 bottom-0 w-1/2 h-2/3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('[Home] Bed zone clicked!');
                      handleLayerClick('bed');
                    }}
                  />
                  
                  {/* Player Click Zone: Roughly center bottom area (visual estimate) */}
                  {/* Positioned to overlap parts of the bed zone if needed, or distinct */}
                  <div 
                    className="absolute left-[35%] bottom-[10%] w-[30%] h-[60%] cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('[Home] Player zone clicked!');
                      handleLayerClick('player');
                    }}
                  />
                </div>
              </div>

          {/* Floating Text Overlay */}
          <AnimatePresence>
            {floatingTexts.map(text => (
              <motion.div
                key={text.id}
                className="absolute pointer-events-none z-30 font-bold text-[#00ff41] text-4xl"
                style={{
                  left: `${text.x}%`,
                  top: `${text.y}%`,
                  // Text shadow effect (no stroke, semi-transparent black shadow)
                  textShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
                }}
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: [0, 1, 1, 0], y: -100, scale: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
              >
                +$活着呢
              </motion.div>
            ))}
          </AnimatePresence>

          {/* 顶部渐变遮罩 - 从纯黑到透明 */}
          <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none z-10" />

          {/* 底部渐变遮罩 - 从透明到纯黑，延伸到屏幕最底部 */}
          <div className="absolute bottom-0 left-0 right-0 h-[350px] bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none z-10" />

          {/* 未连接状态覆盖层 */}
          {!isConnected && <UnconnectedScreen language={language} />}

          {/* 顶部UI容器 - 应用缩放 - 只在已连接时显示 */}
          {isConnected && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[505px] z-20">
              <div 
                className="relative w-full origin-top transition-transform duration-300"
                style={{
                  transform: `scale(${topScale})`,
                }}
              >
                {/* Health血条 - 只在存活时显示? 或者一直显示0? */}
                {/* User usually wants feedback on HP recovery. Let's keep HP bar but maybe styled differently if dead? */}
                {/* Wallet Address Display - Above Health Bar - Lowered to be closer */}
                <div className="absolute left-[34px] top-[24px] z-20">
                  <div className="flex items-center gap-2">
                    <span className="text-[#00ff41] font-mono text-xs font-bold drop-shadow-[0_0_4px_rgba(0,255,65,0.8)]">
                      {walletAddress}
                    </span>
                  </div>
                </div>

                {/* Health血条 - Updated dimensions for healthbar_compressed scaled 70% (216x120) - Internal bar width +5% (110->116) */}
                <div className="absolute left-[12px] top-[41px] w-[216px] h-[120px]">
                  {/* 血条背景 */}
                  <div className="absolute bg-[#323232] h-[57px] left-[22px] top-[30px] w-[116px]" />
                  {/* 血条填充 */}
                  <div
                    className="absolute bg-[#a41f1f] h-[57px] left-[22px] top-[30px] transition-all duration-300"
                    style={{ width: `${(116 * hpPercentage) / 100}px` }}
                  />
                  {/* 血条底部阴影 */}
                  <div
                    className="absolute bg-[#7e0a0a] h-[19px] left-[22px] top-[69px] transition-all duration-300"
                    style={{ width: `${(116 * hpPercentage) / 100}px` }}
                  />
                  {/* HP 数值显示 - 居中在血条 */}
                  <div className="absolute left-[22px] top-[30px] w-[116px] h-[57px] flex items-center justify-center z-10">
                    <motion.p
                      className="font-bold text-white text-[20px] text-center leading-none"
                      style={{
                        textShadow: '0px 2px 4px rgba(0,0,0,0.8)',
                      }}
                      key={hp}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {hp}/{maxHp}
                    </motion.p>
                  </div>
                  {/* Health切图覆盖在最上层 */}
                  <img src={imgHealth} alt="Health" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                </div>
                  
                {/* 状态指标 - Health bar下方 - Moved down due to larger health bar */}
                <div className="absolute left-[12px] top-[180px] w-[240px]">
                  <StatsIndicators
                    isAlive={isAlive}
                    survivalDays={streaks}
                    survivalMultiplier={survivalMultiplier}
                    dopamineIndex={dopamineIndex}
                    language={language}
                  />
                </div>

                {/* $ALIVE代币显示 - 右上角 - 失联时不显示Token Box */}
                {isAlive && (
                  <div className="absolute right-[37px] top-[55px] flex flex-col items-end gap-2 z-30">
                    {/* 功能按钮区域 - 并排显示 */}
                    <div className="flex items-center gap-2 mb-1">
                      {/* 信息按钮 */}
                      <motion.button
                        onClick={() => setIsInfoModalOpen(true)}
                        className="w-8 h-8 rounded-lg bg-black/40 hover:bg-[#00ff41]/20 flex items-center justify-center backdrop-blur-sm group transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                         <HelpCircle className="w-4 h-4 text-[#00ff41]/70 group-hover:text-[#00ff41]" />
                      </motion.button>

                      {/* 语言切换按钮 */}
                      <motion.button
                        onClick={() => setLanguage(language === 'en' ? 'cn' : 'en')}
                        className="w-8 h-8 rounded-lg bg-black/40 hover:bg-[#00ff41]/20 flex items-center justify-center backdrop-blur-sm group transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-[#00ff41]/70 group-hover:text-[#00ff41] font-mono text-xs font-bold">
                          {language === 'en' ? 'EN' : 'CN'}
                        </span>
                      </motion.button>

                      {/* 3-State Audio Control Button */}
                      <motion.button
                        onClick={cycleAudioState}
                        className="w-8 h-8 rounded-lg bg-black/40 hover:bg-[#00ff41]/20 flex items-center justify-center backdrop-blur-sm group transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {audioState === 'all' && (
                          <Volume2 className="w-4 h-4 text-[#00ff41]/70 group-hover:text-[#00ff41]" />
                        )}
                        {audioState === 'sfx_only' && (
                          <Volume1 className="w-4 h-4 text-[#00ff41]/70 group-hover:text-[#00ff41]" />
                        )}
                        {audioState === 'mute' && (
                          <VolumeX className="w-4 h-4 text-[#00ff41]/70 group-hover:text-[#00ff41]" />
                        )}
                      </motion.button>
                      
                      {/* 断开连接按钮 */}
                      <motion.button
                        onClick={() => {
                          setIsConnected(false);
                          toast.info(language === 'en' ? 'Wallet Disconnected' : '已断开钱包连接');
                        }}
                        className="w-8 h-8 rounded-lg bg-black/40 hover:bg-red-500/20 flex items-center justify-center backdrop-blur-sm group transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <LogOut className="w-4 h-4 text-red-500/70 group-hover:text-red-500" />
                      </motion.button>
                    </div>

                    <AliveTokenDisplay 
                      aliveBalance={aliveBalance} 
                      onClick={() => {
                        playSound(soundToken);
                        setIsClaimModalOpen(true);
                      }}
                      className="w-[104px] h-[104px]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 心跳监视器和按钮区域 - 底部 */}
          <div 
            className="absolute bottom-[37px] left-0 right-0 flex items-center justify-center gap-4 px-4 origin-bottom transition-transform duration-300 z-20"
            style={{
              transform: `scale(${bottomScale})`,
            }}
          >
            {/* Store按钮 - 左侧 */}
            <div className="relative w-[125px] h-[116px] flex-shrink-0">
              <motion.button
                onClick={() => navigate('/store')}
                disabled={!isConnected}
                className={`w-full h-full relative ${!isConnected ? 'grayscale cursor-not-allowed opacity-60' : ''}`}
                whileHover={isConnected ? { scale: 1.05 } : {}}
                whileTap={isConnected ? { scale: 0.95 } : {}}
              >
                <img src={imgStoreBtn} alt="Store" className="w-full h-full object-contain" />
              </motion.button>
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <Lock className="w-8 h-8 text-[#00ff41] drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]" />
                </div>
              )}
            </div>

            {/* 心跳按钮 - 中间，带心跳动画 */}
            <div className="relative w-[107px] h-[116px] flex-shrink-0">
              {/* 心跳按钮背景 */}
              <motion.div
                className={`absolute inset-0 ${!isConnected ? 'grayscale opacity-60' : ''}`}
                animate={isConnected ? {
                  scale: isAlive ? [1, 1.1, 1] : 1,
                  opacity: isAlive ? [0.8, 1, 0.8] : 0.5,
                } : {}}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <img src={imgHeartBtnBg} alt="Heart Button Background" className="w-full h-full object-contain" />
              </motion.div>


              {/* 心跳按钮 - 死活都可以点 */}
              <motion.button
                onClick={handleCheckIn}
                disabled={!isConnected}
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[71px] h-[106px] disabled:opacity-50 disabled:cursor-not-allowed z-20 ${!isConnected ? 'grayscale' : ''}`}
                whileHover={isConnected ? { scale: 1.1 } : {}}
                whileTap={isConnected ? { scale: 0.9 } : {}}
                style={{
                  filter: 'drop-shadow(4px 4px 12px rgba(255,255,255,0.66))',
                }}
              >
                <motion.img
                  src={currentHeartImg}
                  alt="Heart Button"
                  className={`w-full h-full object-contain ${!isAlive ? 'saturate-50 contrast-125' : ''}`}
                  animate={isConnected ? {
                    scale: isAlive ? [1, 1.05, 1] : 1,
                  } : {}}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.button>
              
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <Lock className="w-8 h-8 text-[#00ff41] drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]" />
                </div>
              )}
            </div>

            {/* $ALIVE按钮 - 右侧 */}
            <div className="relative w-[124px] h-[116px] flex-shrink-0">
              <motion.button
                onClick={() => {
                  playSound(soundToken);
                  navigate('/leaderboard');
                }}
                disabled={!isConnected}
                className={`w-full h-full relative ${!isConnected ? 'grayscale cursor-not-allowed opacity-60' : ''}`}
                whileHover={isConnected ? { scale: 1.05 } : {}}
                whileTap={isConnected ? { scale: 0.95 } : {}}
              >
                <img src={imgAliveBtn} alt="Leaderboard" className="w-full h-full object-contain" />
              </motion.button>
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <Lock className="w-8 h-8 text-[#00ff41] drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]" />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 心跳签到动画效果 */}
      <AnimatePresence>
        {showHeartbeatEffect && (
          <>
            {/* 绿色闪光效果 - 生命力增强 */}
            <motion.div
              className="absolute inset-0 z-40 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.4, 0],
                backgroundColor: ['rgba(0,255,65,0)', 'rgba(0,255,65,0.3)', 'rgba(0,255,65,0)']
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
            
            {/* 心跳线动画 - 画线效果 */}
            <motion.div
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[120px] z-50 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <svg 
                className="w-full h-full" 
                viewBox="0 0 1000 100" 
                preserveAspectRatio="xMidYMid meet"
              >
                {/* 发光效果层 */}
                <motion.path
                  d="M0,50 L150,50 L180,50 L200,20 L220,80 L240,35 L260,65 L280,50 L350,50 L380,50 L400,15 L420,85 L440,30 L460,70 L480,45 L520,55 L540,50 L650,50 L680,50 L700,25 L720,75 L740,40 L760,60 L780,50 L1000,50"
                  stroke="#00ff41"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.4"
                  filter="blur(4px)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
                {/* 主线条 */}
                <motion.path
                  d="M0,50 L150,50 L180,50 L200,20 L220,80 L240,35 L260,65 L280,50 L350,50 L380,50 L400,15 L420,85 L440,30 L460,70 L480,45 L520,55 L540,50 L650,50 L680,50 L700,25 L720,75 L740,40 L760,60 L780,50 L1000,50"
                  stroke="#00ff41"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="drop-shadow(0 0 6px #00ff41)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
            </motion.div>

            {/* 脉冲波纹效果 */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="w-32 h-32 rounded-full border-4 border-[#00ff41]" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CRT 扫描线效果 */}
      {scanlineEffect}

      {/* 领取奖励模态框 */}
      <ClaimModal isOpen={isClaimModalOpen} onClose={() => setIsClaimModalOpen(false)} />
      
      {/* 信息模态框 */}
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />

      {/* 开发模式面板 */}
      <DevControlPanel />

      {/* Global Sound Manager */}
      <SoundManager />
    </div>
  );
}