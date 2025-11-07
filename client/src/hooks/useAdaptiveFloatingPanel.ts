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
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
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
  isResizing: boolean;
  device: DeviceType;
}

function getViewportInfo() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  const device: DeviceType = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
  
  return { width, height, device };
}

function calculateAdaptiveDimensions(mode: PanelMode, viewport: ReturnType<typeof getViewportInfo>): Dimensions {
  const { width: vw, height: vh, device } = viewport;
  
  // Base dimensions with viewport-relative sizing
  const baseDimensions = {
    compact: {
      width: device === 'mobile' ? Math.min(vw - 20, 350) : Math.min(400, vw * 0.25),
      height: device === 'mobile' ? Math.min(vh - 100, 400) : Math.min(480, vh * 0.4),
      minWidth: device === 'mobile' ? 300 : 350,
      minHeight: device === 'mobile' ? 350 : 400,
      maxWidth: device === 'mobile' ? vw - 20 : Math.min(500, vw * 0.4),
      maxHeight: device === 'mobile' ? vh - 100 : Math.min(600, vh * 0.5),
    },
    expanded: {
      width: device === 'mobile' ? vw - 20 : Math.min(850, vw * 0.55),
      height: device === 'mobile' ? vh - 100 : Math.min(650, vh * 0.75),
      minWidth: device === 'mobile' ? vw - 40 : 650,
      minHeight: device === 'mobile' ? vh - 150 : 500,
      maxWidth: device === 'mobile' ? vw - 10 : Math.min(1200, vw * 0.8),
      maxHeight: device === 'mobile' ? vh - 50 : Math.min(800, vh * 0.9),
    }
  };
  
  return baseDimensions[mode];
}

function getInitialPosition(dimensions: Dimensions, viewport: ReturnType<typeof getViewportInfo>): Position {
  const { width: vw, height: vh, device } = viewport;
  
  // Center on mobile, bottom-right on desktop
  if (device === 'mobile') {
    return {
      x: Math.max(10, (vw - dimensions.width) / 2),
      y: Math.max(50, (vh - dimensions.height) / 2),
    };
  }
  
  return {
    x: Math.max(20, vw - dimensions.width - 20),
    y: Math.max(20, vh - dimensions.height - 20),
  };
}

const STORAGE_KEY = 'adaptive-floating-panel-state';

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
      dimensions: {
        width: state.dimensions?.width,
        height: state.dimensions?.height,
      },
    }));
  } catch {
    // Silent fail
  }
}

export function useAdaptiveFloatingPanel() {
  const [viewport, setViewport] = useState(getViewportInfo);
  
  const [state, setState] = useState<FloatingPanelState>(() => {
    const vp = getViewportInfo();
    const dimensions = calculateAdaptiveDimensions('compact', vp);
    const position = getInitialPosition(dimensions, vp);
    const persisted = loadPersistedState();

    return {
      isVisible: false,
      mode: 'compact' as PanelMode,
      position: persisted?.position || position,
      dimensions: persisted?.dimensions ? {
        ...dimensions,
        width: Math.max(dimensions.minWidth, Math.min(dimensions.maxWidth, persisted.dimensions.width)),
        height: Math.max(dimensions.minHeight, Math.min(dimensions.maxHeight, persisted.dimensions.height)),
      } : dimensions,
      activeStrategy: null,
      isDragging: false,
      isResizing: false,
      device: vp.device,
      ...persisted,
    };
  });

  // Update viewport on resize
  useEffect(() => {
    const handleResize = () => {
      const newViewport = getViewportInfo();
      setViewport(newViewport);
      
      if (newViewport.device !== state.device) {
        const newDimensions = calculateAdaptiveDimensions(state.mode, newViewport);
        const newPosition = getInitialPosition(newDimensions, newViewport);
        
        setState(prev => ({
          ...prev,
          device: newViewport.device,
          dimensions: newDimensions,
          position: newPosition,
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [state.device, state.mode]);

  // Save state changes
  useEffect(() => {
    if (state.isVisible) {
      saveState(state);
    }
  }, [state.mode, state.position, state.dimensions]);

  const openPanel = useCallback((strategy: ActiveStrategy) => {
    const dimensions = calculateAdaptiveDimensions('compact', viewport);
    const position = getInitialPosition(dimensions, viewport);
    
    setState(prev => ({
      ...prev,
      isVisible: true,
      activeStrategy: strategy,
      dimensions,
      position,
      mode: 'compact',
    }));
  }, [viewport]);

  const closePanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false,
      activeStrategy: null,
    }));
  }, []);

  const toggleMode = useCallback(() => {
    const newMode = state.mode === 'compact' ? 'expanded' : 'compact';
    const dimensions = calculateAdaptiveDimensions(newMode, viewport);

    setState(prev => ({
      ...prev,
      mode: newMode,
      dimensions,
    }));
  }, [state.mode, viewport]);

  const updatePosition = useCallback((position: Position) => {
    setState(prev => ({
      ...prev,
      position,
    }));
  }, []);

  const updateDimensions = useCallback((dimensions: Partial<Dimensions>) => {
    setState(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        ...dimensions,
      },
    }));
  }, []);

  const setDragging = useCallback((isDragging: boolean) => {
    setState(prev => ({
      ...prev,
      isDragging,
    }));
  }, []);

  const setResizing = useCallback((isResizing: boolean) => {
    setState(prev => ({
      ...prev,
      isResizing,
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
    isResizing: state.isResizing,
    device: state.device,
    viewport,
    
    // Actions
    openPanel,
    closePanel,
    toggleMode,
    updatePosition,
    updateDimensions,
    setDragging,
    setResizing,
    updateStrategy,
  };
}