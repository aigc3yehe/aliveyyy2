import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface InfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  position?: { x: number; y: number };
  actionButton?: React.ReactNode;
}

export function InfoPopup({ isOpen, onClose, title, description, position, actionButton }: InfoPopupProps) {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999]">
          {/* 透明遮罩 - 点击关闭 */}
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Popup内容 - 末世科技复古风格 - 居中展示 */}
          <div className="absolute inset-0 flex items-start justify-center p-4 pt-32 pointer-events-none">
            <motion.div
              className="relative z-[91] bg-black border-2 border-[#00ff41] shadow-[0_0_30px_rgba(0,255,65,0.3)] w-full max-w-[280px] pointer-events-auto"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="absolute -top-3 -right-3 bg-black border-2 border-[#00ff41] text-[#00ff41] w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#00ff41] hover:text-black transition-all z-20 shadow-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* 标题栏 */}
              <div className="bg-[#00ff41] px-4 py-3">
                <h3 className="text-black font-mono text-base font-bold tracking-wider flex items-center gap-2">
                  <span>{'>'}</span> {title}
                </h3>
              </div>

              {/* 内容区域 */}
              <div className="p-6 relative overflow-hidden">
                <p className="text-gray-300 font-mono text-sm leading-relaxed relative z-10">
                  {description}
                </p>
                
                {actionButton && (
                  <div className="mt-4 relative z-20">
                    {actionButton}
                  </div>
                )}
                
                {/* 点击任意区域关闭提示 (可选，为了响应用户"任意区域") */}
                <div 
                  className="absolute inset-0 z-0 opacity-0"
                  onClick={onClose} 
                  title="点击关闭"
                />
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
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
