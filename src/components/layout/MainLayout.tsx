import { ReactNode } from 'react';
import { Header } from './Header';
import { Toaster } from 'react-hot-toast';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4">{children}</main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
  );
};
