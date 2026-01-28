import { motion } from 'motion/react';
import { useState, useRef } from 'react';
import { InfoPopup } from './InfoPopup';
import { InviteShareModal } from '@/app/components/InviteShareModal';

interface StatsIndicatorsProps {
  isAlive: boolean;
  survivalDays: number;
  survivalMultiplier: number;
  dopamineIndex: number;
  language?: 'en' | 'cn';
}

export function StatsIndicators({
  isAlive,
  survivalDays,
  survivalMultiplier,
  dopamineIndex,
  language = 'en',
}: StatsIndicatorsProps) {
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [showInviteModal, setShowInviteModal] = useState(false);

  // When player is dead, show fixed values
  const displaySurvivalDays = isAlive ? survivalDays : 0;
  const displaySurvivalMultiplier = isAlive ? survivalMultiplier : 1.0;
  const displayDopamineIndex = isAlive ? dopamineIndex : 1.0;

  const buttonRefs = {
    days: useRef<HTMLButtonElement>(null),
    survival: useRef<HTMLButtonElement>(null),
    dopamine: useRef<HTMLButtonElement>(null),
  };

  const handleClick = (type: string, ref: React.RefObject<HTMLButtonElement>) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPopupPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom,
      });
    }
    setActivePopup(type);
  };

  const popupContent = {
    days: {
      title: language === 'en' ? 'SURVIVAL DAYS' : '连续存活天数',
      description: language === 'en' 
        ? 'Survival days track the time you keep your HP above 0. Connection loss (HP=0) resets the count. Longer streaks increase your Survival Multiplier.'
        : '记录你已经连续存活的天数，只要存活，就能获得$活着呢。',
    },
    survival: {
      title: language === 'en' ? 'SURVIVAL MULTIPLIER' : '生存系数',
      description: language === 'en'
        ? 'Survival Multiplier is calculated based on your streak. Higher multiplier means more $活着呢 rewards per check-in. Keep the streak alive!'
        : '生存系数根据连续存活天数计算。系数越高，持续获得$活着呢的速率越快。',
    },
    dopamine: {
      title: language === 'en' ? 'DOPAMINE INDEX' : '多巴胺指数',
      description: language === 'en'
        ? 'Dopamine Index measures your delayed gratification. Restraint is key to survival.'
        : '多巴胺指数衡量你的延迟满足能力。指数越高，持续获得$活着呢的速率越快。领取$活着呢会导致多巴胺指数重置。',
    },
  };

  const renderActionButton = () => {
    if (activePopup === 'dopamine') {
      return (
        <>
          <button
            onClick={() => {
              setActivePopup(null);
              setShowInviteModal(true);
            }}
            className="w-full mt-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-500 py-2 rounded font-mono text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">👑</span>
            {language === 'en' ? 'Invite & Earn!' : '邀请并获得多巴胺！'}
          </button>
           <p 
            onClick={() => {
               setActivePopup(null);
               setShowInviteModal(true);
            }}
            className="text-amber-500/80 font-mono text-[10px] text-center mt-3 font-bold underline decoration-dotted underline-offset-2 cursor-pointer hover:text-amber-400"
          >
            {language === 'en' ? '>> Invite friends! Earn extra Dopamine! <<' : '>> 邀请你的朋友加入！获得额外多巴胺！ <<'}
          </p>
        </>
      );
    }
    return null;
  };

  return (
    <>
      <div className="flex flex-col gap-2 p-3 border-none rounded-lg">
        {/* 状态显示 */}
        <div className="flex items-center justify-start gap-4 pb-2 mb-1">
          <span 
            className="text-gray-300 font-mono text-[13px] font-bold"
            style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
          >
            {language === 'en' ? 'STATUS' : '状态'}
          </span>
          <motion.span
            className={`font-mono text-[16px] font-bold ${isAlive ? 'text-[#00ff41]' : 'text-red-500'}`}
            style={{
              textShadow: isAlive 
                ? '0px 2px 4px rgba(0,0,0,0.8), 0px 0px 8px rgba(0,255,65,0.4)'
                : '0px 2px 4px rgba(0,0,0,0.8), 0px 0px 8px rgba(239,68,68,0.4)',
            }}
            key={isAlive ? 'alive' : 'dead'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {isAlive ? (language === 'en' ? 'ALIVE' : '存活') : (language === 'en' ? 'LOST' : '失联')}
          </motion.span>
        </div>

        {/* 连续存活天数 */}
        <motion.button
          ref={buttonRefs.days as React.RefObject<HTMLButtonElement>}
          onClick={() => handleClick('days', buttonRefs.days as React.RefObject<HTMLButtonElement>)}
          className="text-left group w-full"
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-start gap-4">
            <span 
              className="text-gray-300 font-mono text-[13px] font-bold"
              style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
            >
              {language === 'en' ? 'DAYS' : '存活天数'}
            </span>
            <motion.span
              className="text-[#00ff41] font-mono text-[16px] font-bold border-b border-dashed border-[#00ff41]/50 group-hover:border-[#00ff41]"
              style={{
                textShadow: '0px 2px 4px rgba(0,0,0,0.8), 0px 0px 8px rgba(0,255,65,0.4)',
              }}
              key={displaySurvivalDays}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {displaySurvivalDays}{language === 'en' ? 'd' : '天'}
            </motion.span>
          </div>
        </motion.button>

        {/* 连续存活系数 */}
        <motion.button
          ref={buttonRefs.survival as React.RefObject<HTMLButtonElement>}
          onClick={() => handleClick('survival', buttonRefs.survival as React.RefObject<HTMLButtonElement>)}
          className="text-left group w-full"
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-start gap-4">
            <span 
              className="text-gray-300 font-mono text-[13px] font-bold"
              style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
            >
              {language === 'en' ? 'MULTIPLIER' : '存活系数'}
            </span>
            <motion.span
              className="text-yellow-400 font-mono text-[16px] font-bold border-b border-dashed border-yellow-400/50 group-hover:border-yellow-400"
              style={{
                textShadow: '0px 2px 4px rgba(0,0,0,0.8), 0px 0px 8px rgba(250,204,21,0.4)',
              }}
              key={displaySurvivalMultiplier}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              x{displaySurvivalMultiplier.toFixed(1)}
            </motion.span>
          </div>
        </motion.button>

        {/* 多巴胺指数 */}
        <motion.button
          ref={buttonRefs.dopamine as React.RefObject<HTMLButtonElement>}
          onClick={() => handleClick('dopamine', buttonRefs.dopamine as React.RefObject<HTMLButtonElement>)}
          className="text-left group w-full"
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-start gap-4">
            <span 
              className="text-gray-300 font-mono text-[13px] font-bold"
              style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
            >
              {language === 'en' ? 'DOPAMINE' : '多巴胺指数'}
            </span>
            <motion.span
              className="text-orange-400 font-mono text-[16px] font-bold border-b border-dashed border-orange-400/50 group-hover:border-orange-400"
              style={{
                textShadow: '0px 2px 4px rgba(0,0,0,0.8), 0px 0px 8px rgba(251,146,60,0.4)',
              }}
              key={displayDopamineIndex}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              x{displayDopamineIndex.toFixed(1)}
            </motion.span>
          </div>
        </motion.button>
      </div>

      {/* 信息弹窗 */}
      {activePopup && (
        <InfoPopup
          isOpen={true}
          onClose={() => setActivePopup(null)}
          title={popupContent[activePopup as keyof typeof popupContent].title}
          description={popupContent[activePopup as keyof typeof popupContent].description}
          position={popupPosition}
        />
      )}

      {/* Invite Share Modal */}
      <InviteShareModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)}
      />
    </>
  );
}