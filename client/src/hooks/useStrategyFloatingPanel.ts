import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from './use-mobile';

export type PanelMode = 'compact' | 'expanded';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface Position {
  x: number;
  y: number;
}

interface Dimensions {
  width: number;
  height: number;
}

interface ActiveStrategy {
  id: string;
  name: string;
  numbers: number[];
  type: string;
  attempts: number;
  maxAttempts: number;
  successRate: number;
}

interface FloatingPanelState {
  isVisible: boolean;
  mode: PanelMode;
  position: Position;
  dimensions: Dimensions;
  activeStrategy: ActiveStrategy | null;
  isDragging: boolean;
  device: DeviceType;
}

const RESPONSIVE_CONFIG = {
  mobile: {
    compact: { width: 340, height: 340 }, // 90vw max
    expanded: { width: 0, height: 0 }, // Fullscreen modal
  },
  tablet: {
    compact: { width: 350, height: 350 },
    expanded: { width: 600, height: 450 },
  },
  desktop: {
    compact: { width: 350, height: 350 },
    expanded: { width: 750, height: 500 },
  },
};

const STORAGE_KEY = 'strategy-floating-panel-state';

function getDeviceType(): DeviceType {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function getInitialPosition(device: DeviceType, dimensions: Dimensions): Position {
  const { innerWidth, innerHeight } = window;
  
  switch (device) {
    case 'mobile':
      return { x: 10, y: innerHeight - dimensions.height - 10 };
    case 'tablet':
    case 'desktop':
    default:
      return { 
        x: innerWidth - dimensions.width - 20, 
        y: innerHeight - dimensions.height - 20 
      };
  }
}

function loadPersistedState(): Partial<FloatingPanelState> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveState(state: Partial<FloatingPanelState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      mode: state.mode,
      position: state.position,
    }));
  } catch {
    // Silent fail
  }
}

export function useStrategyFloatingPanel() {
  const isMobileHook = useIsMobile();
  const [device, setDevice] = useState<DeviceType>(getDeviceType);
  
  const [state, setState] = useState<FloatingPanelState>(() => {
    const deviceType = getDeviceType();
    const config = RESPONSIVE_CONFIG[deviceType];
    const dimensions = config.compact;
    const position = getInitialPosition(deviceType, dimensions);
    const persisted = loadPersistedState();

    return {
      isVisible: false,
      mode: 'compact' as PanelMode,
      position: persisted?.position || position,
      dimensions,
      activeStrategy: null,
      isDragging: false,
      device: deviceType,
      ...persisted,
    };
  });

  // Update device type on resize
  useEffect(() => {
    const handleResize = () => {
      const newDevice = getDeviceType();
      if (newDevice !== device) {
        setDevice(newDevice);
        const config = RESPONSIVE_CONFIG[newDevice];
        const newDimensions = config[state.mode];
        
        setState(prev => ({
          ...prev,
          device: newDevice,
          dimensions: newDimensions,
          position: getInitialPosition(newDevice, newDimensions),
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [device, state.mode]);

  // Save state changes
  useEffect(() => {
    if (state.isVisible) {
      saveState(state);
    }
  }, [state.mode, state.position]);

  const openPanel = useCallback((strategy: ActiveStrategy) => {
    const config = RESPONSIVE_CONFIG[device];
    const dimensions = config.compact;
    
    setState(prev => ({
      ...prev,
      isVisible: true,
      activeStrategy: strategy,
      dimensions,
      mode: 'compact',
    }));
  }, [device]);

  const closePanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
      activeStrategy: null,
    }));
  }, []);

  const toggleMode = useCallback(() => {
    const newMode = state.mode === 'compact' ? 'expanded' : 'compact';
    const config = RESPONSIVE_CONFIG[device];
    const dimensions = config[newMode];

    setState(prev => ({
      ...prev,
      mode: newMode,
      dimensions,
    }));
  }, [state.mode, device]);

  const updatePosition = useCallback((position: Position) => {
    setState(prev => ({
      ...prev,
      position,
    }));
  }, []);

  const setDragging = useCallback((isDragging: boolean) => {
    setState(prev => ({
      ...prev,
      isDragging,
    }));
  }, []);

  const updateStrategy = useCallback((strategy: Partial<ActiveStrategy>) => {
    setState(prev => ({
      ...prev,
      activeStrategy: prev.activeStrategy ? {
        ...prev.activeStrategy,
        ...strategy,
      } : null,
    }));
  }, []);

  return {
    // State
    isVisible: state.isVisible,
    mode: state.mode,
    position: state.position,
    dimensions: state.dimensions,
    activeStrategy: state.activeStrategy,
    isDragging: state.isDragging,
    device: state.device,
    
    // Actions
    openPanel,
    closePanel,
    toggleMode,
    updatePosition,
    setDragging,
    updateStrategy,
  };
}