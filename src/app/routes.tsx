import { createBrowserRouter } from 'react-router';
import Home from '@/app/pages/Home';
import Store from '@/app/pages/Store';
import Leaderboard from '@/app/pages/Leaderboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/store',
    element: <Store />,
  },
  {
    path: '/leaderboard',
    element: <Leaderboard />,
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-4xl font-bold mb-4">404 - 页面未找到</h1>
          <a href="/" className="text-green-400 text-xl hover:underline">
            返回首页
          </a>
        </div>
      </div>
    ),
  },
]);
