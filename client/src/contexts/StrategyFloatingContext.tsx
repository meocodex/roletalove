import { createContext, useContext, ReactNode } from 'react';
import { useAdaptiveFloatingPanel } from '@/hooks/useAdaptiveFloatingPanel';

type ActiveStrategy = {
  id: string;
  name: string;
  numbers: number[];
  type: string;
  attempts: number;
  maxAttempts: number;
  successRate: number;
};

interface StrategyFloatingContextType {
  isVisible: boolean;
  mode: 'compact' | 'expanded';
  activeStrategy: ActiveStrategy | null;
  openPanel: (strategy: ActiveStrategy) => void;
  closePanel: () => void;
  toggleMode: () => void;
}

const StrategyFloatingContext = createContext<StrategyFloatingContextType | null>(null);

interface StrategyFloatingProviderProps {
  children: ReactNode;
}

export function StrategyFloatingProvider({ children }: StrategyFloatingProviderProps) {
  const floatingPanel = useAdaptiveFloatingPanel();

  const contextValue: StrategyFloatingContextType = {
    isVisible: floatingPanel.isVisible,
    mode: floatingPanel.mode,
    activeStrategy: floatingPanel.activeStrategy,
    openPanel: floatingPanel.openPanel,
    closePanel: floatingPanel.closePanel,
    toggleMode: floatingPanel.toggleMode,
  };

  return (
    <StrategyFloatingContext.Provider value={contextValue}>
      {children}
    </StrategyFloatingContext.Provider>
  );
}

export function useStrategyFloating() {
  const context = useContext(StrategyFloatingContext);
  if (!context) {
    throw new Error('useStrategyFloating must be used within a StrategyFloatingProvider');
  }
  return context;
}