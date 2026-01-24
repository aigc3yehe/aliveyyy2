import { RouterProvider } from 'react-router';
import { router } from '@/app/routes.tsx';
import { Toaster } from '@/app/components/ui/sonner';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </>
  );
}