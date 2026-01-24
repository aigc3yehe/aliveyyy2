import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '@/app/stores/useGameStore';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import imgFe494Eac1A744C06A8Dd40208Ae38Bdf5 from '@/assets/931f8f55564bd4e3bd95cdb7a89980e1a1c18de7.webp';

import imgFkp from '@/assets/fkp.webp';
import { formatTokenCount } from '@/utils/format';

export default function Store() {
  const { aliveBalance, buyItem, language } = useGameStore();
  const [selectedItem, setSelectedItem] = useState<(typeof storeItems)[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const storeItems = [
    {
      id: 'soul-mate',
      image: imgFkp,
      name: language === 'en' ? 'Soul Mate' : '灵魂伴侣',
      description: language === 'en' ? 'Seems to be a necessity' : '似乎是必需品。',
      price: 10000,
      priceType: 'alive',
    },
    {
      id: 'pacemaker',
      icon: '💓',
      name: language === 'en' ? 'Pacemaker' : '心脏起搏器',
      description: language === 'en' ? 'Auto revive once, hold one skill' : '自动复活一次，技能持有一个。',
      price: 100000,
      priceType: 'alive',
    },
  ];

  const handlePurchase = () => {
    if (!selectedItem) return;

    if (selectedItem.priceType === 'eth') {
      toast.info(language === 'en' ? 'Web3 Feature in Development' : 'Web3功能开发中', {
        description: language === 'en' ? 'Please use crypto later' : '请稍后使用加密货币购买',
      });
      setIsDialogOpen(false);
      return;
    }

    if (typeof selectedItem.price === 'number' && aliveBalance >= selectedItem.price) {
      buyItem(selectedItem.id, selectedItem.price);
      toast.success(language === 'en' ? 'Purchase Successful!' : '购买成功！', {
        description: language === 'en' ? `You obtained ${selectedItem.name}` : `你获得了 ${selectedItem.name}`,
      });
    } else {
      toast.error(language === 'en' ? 'Insufficient Balance' : '余额不足', {
        description: language === 'en' ? `Requires ${selectedItem.price} $活着呢` : `需要 ${selectedItem.price} $活着呢`,
      });
    }
    setIsDialogOpen(false);
  };

  const openPurchaseDialog = (item: typeof storeItems[0]) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

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
          <div className="relative w-full h-full overflow-y-auto custom-scrollbar">
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
                    {'>'} {language === 'en' ? 'SUPPLY_DEPOT' : '物资补给站'}
                  </h1>
                  <p className="text-gray-400 font-mono text-sm">
                    // {language === 'en' ? 'Exchange $活着呢 for supplies' : '使用 $活着呢 代币兑换生存物资'}
                  </p>
                </motion.div>

                {/* 余额显示 - 终端风格 */}
                <motion.div
                  className="bg-black border border-[#00ff41]/30 p-4 font-mono"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">
                      {language === 'en' ? 'BALANCE:' : '余额:'}
                    </span>
                    <motion.span
                      className="text-[#00ff41] text-xl font-bold"
                      key={aliveBalance.toFixed(2)}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {formatTokenCount(aliveBalance)} $活着呢
                    </motion.span>
                  </div>
                </motion.div>
              </div>

              {/* 商品列表 - 宫格风格 */}
              <div className="grid grid-cols-2 gap-4">
                {storeItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="group relative bg-black border border-[#00ff41]/20 hover:border-[#00ff41] transition-colors duration-300 cursor-pointer overflow-hidden flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openPurchaseDialog(item)}
                  >
                    {/* 正方形封面区域 */}
                    <div className="relative w-full aspect-square border-b border-[#00ff41]/20 bg-[#00ff41]/5 group-hover:bg-[#00ff41]/10 transition-colors flex items-center justify-center overflow-hidden">
                       {item.image ? (
                           <img 
                             src={item.image} 
                             alt={item.name} 
                             className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300" 
                           />
                       ) : (
                         <span className="text-6xl filter drop-shadow-[0_0_8px_rgba(0,255,65,0.4)]">
                           {item.icon}
                         </span>
                       )}
                       {/* 装饰性角标 */}
                       <div className="absolute top-2 left-2 w-2 h-2 border-l border-t border-[#00ff41]/50" />
                       <div className="absolute top-2 right-2 w-2 h-2 border-r border-t border-[#00ff41]/50" />
                       <div className="absolute bottom-2 left-2 w-2 h-2 border-l border-b border-[#00ff41]/50" />
                       <div className="absolute bottom-2 right-2 w-2 h-2 border-r border-b border-[#00ff41]/50" />
                    </div>

                    {/* 内容详情 */}
                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="text-[#00ff41] font-mono text-sm font-bold mb-1 truncate">
                        {item.name}
                      </h3>
                      <p className="text-gray-400 font-mono text-xs mb-2 line-clamp-2 min-h-[2.5em] flex-1">
                        {item.description}
                      </p>
                      <div className="mt-auto pt-2 border-t border-[#00ff41]/10 flex justify-between items-center">
                         <span className={`font-mono text-xs font-bold ${item.priceType === 'eth' ? 'text-[#ffa500]' : 'text-[#00ff41]'}`}>
                           {item.priceType === 'eth' ? item.price : formatTokenCount(Number(item.price))}
                         </span>
                         {item.priceType !== 'eth' && <span className="text-[10px] text-gray-500">$活着呢</span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 底部提示信息 */}
              <motion.div
                className="mt-8 border-t border-[#00ff41]/20 pt-6 pb-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <p className="text-gray-500 font-mono text-xs text-center">
                  // {language === 'en' ? 'WARNING: ALL TRANSACTIONS IRREVERSIBLE' : '警告: 所有交易不可逆转'}
                </p>
                <p className="text-gray-600 font-mono text-xs text-center mt-1">
                  // {language === 'en' ? 'STATUS: ONLINE | NETWORK: SECURE' : '状态: 在线 | 网络: 安全'}
                </p>
              </motion.div>
            </div>
          </div>

          {/* CRT 扫描线效果 */}
          {scanlineEffect}
        </motion.div>
      </div>

      {/* 购买确认弹窗 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-[#00ff41] bg-black text-[#00ff41] font-mono max-w-[90vw] w-80 sm:w-96 rounded-none border-2">
          <DialogHeader>
            <DialogTitle className="text-xl border-b border-[#00ff41]/30 pb-2">
                 {language === 'en' ? 'CONFIRM_PURCHASE' : '确认购买'}
            </DialogTitle>
            <DialogDescription className="text-gray-400 pt-2">
               {language === 'en' ? 'Authorize transaction?' : '是否授权此交易?'}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="py-4 space-y-4">
               <div className="flex gap-4 items-center bg-[#00ff41]/5 p-3 border border-[#00ff41]/30">
                  <div className="w-16 h-16 flex items-center justify-center bg-black overflow-hidden flex-shrink-0">
                      {selectedItem.image ? (
                           <img 
                             src={selectedItem.image} 
                             alt={selectedItem.name} 
                             className="w-full h-full object-cover" 
                           />
                       ) : (
                         <span className="text-4xl">
                           {selectedItem.icon}
                         </span>
                       )}
                  </div>
                  <div>
                    <div className="font-bold">{selectedItem.name}</div>
                    <div className="text-xs text-gray-400">{selectedItem.description}</div>
                  </div>
               </div>
               
               <div className="flex justify-between items-end border-b border-dashed border-[#00ff41]/30 pb-1">
                  <span className="text-sm text-gray-500">COST:</span>
                  <span className={`text-lg font-bold ${selectedItem.priceType === 'eth' ? 'text-[#ffa500]' : 'text-[#00ff41]'}`}>
                    {selectedItem.priceType === 'eth' ? selectedItem.price : `${formatTokenCount(Number(selectedItem.price))} $活着呢`}
                  </span>
               </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
             <Button
                variant="outline"
                className="bg-black border-[#00ff41]/50 text-[#00ff41] hover:bg-[#00ff41]/10 hover:text-[#00ff41] rounded-none w-full sm:w-auto"
                onClick={() => setIsDialogOpen(false)}
             >
                {language === 'en' ? 'CANCEL' : '取消'}
             </Button>
             <Button
                className="bg-[#00ff41] text-black hover:bg-[#00ff41]/80 rounded-none font-bold w-full sm:w-auto"
                onClick={handlePurchase}
             >
                {language === 'en' ? 'CONFIRM' : '确认'}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
