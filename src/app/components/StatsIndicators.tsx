import { motion } from 'motion/react';
import { useState, useRef } from 'react';
import { InfoPopup } from './InfoPopup';
import { InviteShareModal } from '@/app/components/InviteShareModal';

interface StatsIndicatorsProps {
  isAlive: boolean;
  aliveStreakDays: number;
  survivalMultiplier: number;
  dopamineIndex: number;
}

import { useTranslation } from 'react-i18next';

export function StatsIndicators({
  isAlive,
  aliveStreakDays,
  survivalMultiplier,
  dopamineIndex,
}: StatsIndicatorsProps) {
  const { t } = useTranslation();
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [showInviteModal, setShowInviteModal] = useState(false);

  // When player is dead, show fixed values
  const displayAliveStreakDays = isAlive ? aliveStreakDays : 0;
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
      title: t('stats.survivalDays'),
      description: t('stats.survivalDaysDesc'),
    },
    survival: {
      title: t('stats.survivalMultiplier'),
      description: t('stats.survivalMultiplierDesc'),
    },
    dopamine: {
      title: t('stats.dopamineIndex'),
      description: t('stats.dopamineIndexDesc'),
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
            {t('invite.button')}
          </button>
          <p
            onClick={() => {
              setActivePopup(null);
              setShowInviteModal(true);
            }}
            className="text-amber-500/80 font-mono text-[10px] text-center mt-3 font-bold underline decoration-dotted underline-offset-2 cursor-pointer hover:text-amber-400"
          >
            {t('invite.earnDopamine')}
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
            {t('stats.status')}
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
            {isAlive ? t('stats.alive') : t('stats.lost')}
          </motion.span>
        </div>

        {/* 连续存活天数 - 移除点击交互 */}
        <div className="text-left w-full">
          <div className="flex items-center justify-start gap-4">
            <span
              className="text-gray-300 font-mono text-[13px] font-bold"
              style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' }}
            >
              {t('stats.days')}
            </span>
            <motion.span
              className="text-[#00ff41] font-mono text-[16px] font-bold"
              style={{
                textShadow: '0px 2px 4px rgba(0,0,0,0.8), 0px 0px 8px rgba(0,255,65,0.4)',
              }}
              key={displayAliveStreakDays}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {displayAliveStreakDays}{t('stats.dayUnit')}
            </motion.span>
          </div>
        </div>

        {/* [HIDDEN] 连续存活系数 - 暂时隐藏 */}
        {/* <motion.button
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
              {t('stats.multiplier')}
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
        </motion.button> */}

        {/* [HIDDEN] 多巴胺指数 - 暂时隐藏 */}
        {/* <motion.button
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
              {t('stats.dopamine')}
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
        </motion.button> */}
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
