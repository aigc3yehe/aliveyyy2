import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useGameStore } from '@/app/stores/useGameStore';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const { language } = useGameStore();
  const [activeTab, setActiveTab] = useState<'doctrine' | 'rules'>('doctrine');

  const content = {
    doctrine: {
      title: language === 'en' ? 'DOCTRINE' : '学说',
      body: (
        <div className="space-y-6 font-mono text-sm leading-relaxed text-gray-300">
          <h3 className="text-[#00ff41] text-lg font-bold mb-4">
            {language === 'en' ? '$ALIVE — EXISTENCE IS VALUE' : '$活着呢 — 存在即价值'}
          </h3>
          <p>
            {language === 'en' 
              ? 'Your existence every day is forging value.' 
              : '你每一天的存在，都在铸造价值。'}
          </p>
          <p>
            {language === 'en'
              ? 'Every heartbeat is a confirmation of life.'
              : '每次心跳，都是对生命的确认。'}
          </p>
          <p>
            {language === 'en'
              ? 'The longer the streak, the higher the dopamine, the richer the harvest.'
              : '连续存活天数越多，多巴胺越高，收获越丰。'}
          </p>
        </div>
      )
    },
    rules: {
      title: language === 'en' ? 'RULES' : '规则',
      body: (
        <div className="space-y-6 font-mono text-sm">
           <h3 className="text-[#00ff41] text-lg font-bold mb-4">
            {language === 'en' ? 'SURVIVAL LAWS' : '生存法则'}
          </h3>
          
          <div className="border border-[#00ff41]/30 rounded-sm overflow-hidden">
            <div className="grid grid-cols-[100px_1fr] border-b border-[#00ff41]/30">
              <div className="p-3 bg-[#00ff41]/5 text-[#00ff41] font-bold border-r border-[#00ff41]/30">
                {language === 'en' ? 'HP' : 'HP'}
              </div>
              <div className="p-3 text-gray-300">
                {language === 'en' 
                  ? 'Max 48. -1 per hour. Zero = Signal Lost.' 
                  : '最大48点，每小时-1。归零=信号丢失。'}
              </div>
            </div>
            
            <div className="grid grid-cols-[100px_1fr] border-b border-[#00ff41]/30">
              <div className="p-3 bg-[#00ff41]/5 text-[#00ff41] font-bold border-r border-[#00ff41]/30">
                {language === 'en' ? 'Check-in' : '签到'}
              </div>
              <div className="p-3 text-gray-300">
                {language === 'en'
                  ? 'Recover 1 HP. Increases survival streak bonus.'
                  : '恢复1点HP，增加连续存活天数加成。'}
              </div>
            </div>

            <div className="grid grid-cols-[100px_1fr] border-b border-[#00ff41]/30">
              <div className="p-3 bg-[#00ff41]/5 text-[#00ff41] font-bold border-r border-[#00ff41]/30">
                {language === 'en' ? 'Dopamine' : '多巴胺指数'}
              </div>
              <div className="p-3 text-gray-300">
                {language === 'en'
                  ? 'Grows by not claiming $Alive for consecutive days.'
                  : '将 $活着呢 留在待领取箱内则会增长多巴胺系数。'}
              </div>
            </div>

            <div className="grid grid-cols-[100px_1fr]">
              <div className="p-3 bg-[#00ff41]/5 text-[#00ff41] font-bold border-r border-[#00ff41]/30">
                {language === 'en' ? 'Claim' : '领取'}
              </div>
              <div className="p-3 text-gray-300">
                {language === 'en'
                  ? 'Transfer pending tokens to balance. Resets Dopamine.'
                  : '将待领取代币转入余额，多巴胺重置。'}
              </div>
            </div>
          </div>

          <div className="p-3 border-l-2 border-yellow-500 bg-yellow-500/5 text-yellow-500/80 text-xs">
            {language === 'en' 
              ? 'SURVIVAL TIP: Delay claiming to accumulate higher Dopamine Index.' 
              : '生存建议：延迟领取，积累更高多巴胺指数。'}
          </div>
        </div>
      )
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            className="fixed left-1/2 top-[15%] -translate-x-1/2 w-[90%] max-w-[500px] h-[600px] bg-black border-2 border-[#00ff41] z-[101] flex flex-col"
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-[#00ff41]/30">
              <h2 className="text-[#00ff41] font-mono text-xl font-bold tracking-wider">
                {'>'} SYSTEM_INFO
              </h2>
              <button
                onClick={onClose}
                className="text-[#00ff41] hover:bg-[#00ff41]/10 p-1 rounded transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#00ff41]/30">
              <button
                className={`flex-1 py-3 font-mono font-bold transition-colors ${
                  activeTab === 'doctrine' 
                    ? 'bg-[#00ff41] text-black' 
                    : 'text-[#00ff41] hover:bg-[#00ff41]/10'
                }`}
                onClick={() => setActiveTab('doctrine')}
              >
                {content.doctrine.title}
              </button>
              <button
                className={`flex-1 py-3 font-mono font-bold transition-colors ${
                  activeTab === 'rules' 
                    ? 'bg-[#00ff41] text-black' 
                    : 'text-[#00ff41] hover:bg-[#00ff41]/10'
                }`}
                onClick={() => setActiveTab('rules')}
              >
                {content.rules.title}
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {content[activeTab].body}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#00ff41]/30 text-center">
              <p className="text-gray-600 font-mono text-xs">
                // {language === 'en' ? 'AS LONG AS YOU SURVIVE, YOU EARN $ALIVE' : '只要生存，就能获得$活着呢'}
              </p>
            </div>

             {/* CRT Scanline Effect */}
             <div
              className="absolute inset-0 pointer-events-none z-[102]"
              style={{
                background:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.03) 2px, rgba(0, 255, 65, 0.03) 4px)',
                boxShadow: 'inset 0 0 20px rgba(0, 255, 65, 0.1)'
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
