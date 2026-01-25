import { motion } from 'motion/react';
import imgAliveBox from '@/assets/a79000fb81e5a0137244a4df80a9088ba12aa034.webp';

interface AliveTokenDisplayProps {
  aliveBalance: number;
  onClick?: () => void;
  className?: string;
}

import { formatTokenCount } from '@/utils/format';

export function AliveTokenDisplay({ aliveBalance, onClick, className }: AliveTokenDisplayProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative cursor-pointer ${className || 'w-[130px] h-[130px]'}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        filter: 'drop-shadow(0px 0px 0px rgba(0, 255, 65, 0))',
      }}
      animate={{
        filter: [
          'drop-shadow(0px 0px 10px rgba(0, 255, 65, 0.4))',
          'drop-shadow(0px 0px 25px rgba(0, 255, 65, 0.8))',
          'drop-shadow(0px 0px 10px rgba(0, 255, 65, 0.4))',
        ],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* 金色宝箱切图背景 */}
      <img
        src={imgAliveBox}
        alt="$活着吧 Token Box"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />

      {/* 代币数值显示 - 在宝箱顶部中央 */}
      <div className="absolute left-1/2 top-[25%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.p
          className="font-bold text-[#00ff41] text-[20px] text-center leading-none"
          style={{
            textShadow: '0px 4px 8px rgba(0,0,0,0.9), 0px 0px 20px rgba(0,255,65,0.6)',
            WebkitTextStroke: '1px rgba(0,0,0,0.6)',
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          +{formatTokenCount(aliveBalance)}
        </motion.p>
      </div>
    </motion.button>
  );
}