import { useEffect } from 'react';
import { useGameStore } from '@/app/stores/useGameStore';

export function useGameLoop() {
  const { updateHpFromTime, aliveBalance, setAliveBalance, hp, isAlive } = useGameStore();

  // HP 倒计时循环
  useEffect(() => {
    const interval = setInterval(() => {
      updateHpFromTime();
    }, 1000); // 每秒更新一次

    return () => clearInterval(interval);
  }, [updateHpFromTime]);

  // 代币产出动画 - 只有在存活时才产出
  useEffect(() => {
    if (!isAlive || hp <= 0) return;

    const interval = setInterval(() => {
      // 每小时产出约100 活着呢，每秒约0.0278 活着呢
      const rate = 100 / 3600; // 每秒产出
      const newBalance = aliveBalance + rate;
      setAliveBalance(newBalance);
    }, 1000); // 每秒更新一次

    return () => clearInterval(interval);
  }, [aliveBalance, hp, isAlive, setAliveBalance]);

  return { updateHpFromTime };
}