import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  GripHorizontal,
  Target,
  Move,
  RotateCw
} from 'lucide-react';
import { useAdaptiveFloatingPanel } from '@/hooks/useAdaptiveFloatingPanel';
import { CompactView } from './strategy-floating/CompactView';
import { ExpandedView } from './strategy-floating/ExpandedView';
import { cn } from '@/lib/utils';

interface ResizeHandlesProps {
  onMouseDown: (direction: string, e: React.MouseEvent) => void;
  isResizing: boolean;
}

function ResizeHandles({ onMouseDown, isResizing }: ResizeHandlesProps) {
  if (isResizing) return null; // Hide during resize to prevent interference

  return (
    <>
      {/* Corner handles */}
      <div 
        className="absolute -top-1 -left-1 w-3 h-3 bg-roulette-green rounded-full cursor-nw-resize hover:scale-110 transition-transform"
        onMouseDown={(e) => onMouseDown('nw', e)}
        title="Redimensionar"
      />
      <div 
        className="absolute -top-1 -right-1 w-3 h-3 bg-roulette-green rounded-full cursor-ne-resize hover:scale-110 transition-transform"
        onMouseDown={(e) => onMouseDown('ne', e)}
        title="Redimensionar"
      />
      <div 
        className="absolute -bottom-1 -left-1 w-3 h-3 bg-roulette-green rounded-full cursor-sw-resize hover:scale-110 transition-transform"
        onMouseDown={(e) => onMouseDown('sw', e)}
        title="Redimensionar"
      />
      <div 
        className="absolute -bottom-1 -right-1 w-3 h-3 bg-roulette-green rounded-full cursor-se-resize hover:scale-110 transition-transform"
        onMouseDown={(e) => onMouseDown('se', e)}
        title="Redimensionar"
      />
      
      {/* Edge handles */}
      <div 
        className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-roulette-green/70 rounded-full cursor-n-resize hover:bg-roulette-green transition-colors"
        onMouseDown={(e) => onMouseDown('n', e)}
        title="Redimensionar verticalmente"
      />
      <div 
        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-roulette-green/70 rounded-full cursor-s-resize hover:bg-roulette-green transition-colors"
        onMouseDown={(e) => onMouseDown('s', e)}
        title="Redimensionar verticalmente"
      />
      <div 
        className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-roulette-green/70 rounded-full cursor-w-resize hover:bg-roulette-green transition-colors"
        onMouseDown={(e) => onMouseDown('w', e)}
        title="Redimensionar horizontalmente"
      />
      <div 
        className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-roulette-green/70 rounded-full cursor-e-resize hover:bg-roulette-green transition-colors"
        onMouseDown={(e) => onMouseDown('e', e)}
        title="Redimensionar horizontalmente"
      />
    </>
  );
}

interface FloatingHeaderProps {
  strategy: any;
  mode: 'compact' | 'expanded';
  onToggleMode: () => void;
  onClose: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  isDragging: boolean;
}

function FloatingHeader({ strategy, mode, onToggleMode, onClose, onDragStart, isDragging }: FloatingHeaderProps) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between px-3 py-2 bg-gray-800/95 border-b border-gray-700 cursor-move select-none",
        isDragging && "cursor-grabbing"
      )}
      onMouseDown={onDragStart}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Move className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <Target className="w-4 h-4 text-roulette-green flex-shrink-0" />
        <span className="text-sm font-medium text-white truncate">
          {strategy.name}
        </span>
        <Badge variant="outline" className="text-xs text-gray-300 border-gray-600 flex-shrink-0">
          {strategy.attempts}/{strategy.maxAttempts}
        </Badge>
      </div>
      
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleMode}
          className="h-6 w-6 p-0 hover:bg-gray-700"
        >
          {mode === 'compact' ? (
            <Maximize2 className="w-3 h-3" />
          ) : (
            <Minimize2 className="w-3 h-3" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0 hover:bg-gray-700 text-red-400 hover:text-red-300"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export default function AdaptiveStrategyPanel() {
  const {
    isVisible,
    mode,
    position,
    dimensions,
    activeStrategy,
    device,
    isDragging,
    isResizing,
    closePanel,
    toggleMode,
    updatePosition,
    updateDimensions,
    setDragging,
    setResizing,
    viewport,
  } = useAdaptiveFloatingPanel();

  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ 
    startX: number; 
    startY: number; 
    startMouseX: number; 
    startMouseY: number; 
  } | null>(null);
  const resizeRef = useRef<{ 
    direction: string;
    startWidth: number;
    startHeight: number;
    startX: number;
    startY: number;
    startMouseX: number;
    startMouseY: number;
  } | null>(null);

  // Drag functionality
  const handleDragStart = (e: React.MouseEvent) => {
    if (device === 'mobile' || isResizing) return;
    
    e.preventDefault();
    setDragging(true);
    
    dragRef.current = {
      startX: position.x,
      startY: position.y,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
    };
  };

  // Resize functionality
  const handleResizeStart = (direction: string, e: React.MouseEvent) => {
    if (device === 'mobile' || isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    
    resizeRef.current = {
      direction,
      startWidth: dimensions.width,
      startHeight: dimensions.height,
      startX: position.x,
      startY: position.y,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
    };
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Handle dragging
      if (isDragging && dragRef.current) {
        const deltaX = e.clientX - dragRef.current.startMouseX;
        const deltaY = e.clientY - dragRef.current.startMouseY;

        const newX = Math.max(0, Math.min(
          viewport.width - dimensions.width,
          dragRef.current.startX + deltaX
        ));

        const newY = Math.max(0, Math.min(
          viewport.height - dimensions.height,
          dragRef.current.startY + deltaY
        ));

        updatePosition({ x: newX, y: newY });
      }

      // Handle resizing
      if (isResizing && resizeRef.current) {
        const { direction, startWidth, startHeight, startX, startY, startMouseX, startMouseY } = resizeRef.current;
        const deltaX = e.clientX - startMouseX;
        const deltaY = e.clientY - startMouseY;

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startX;
        let newY = startY;

        // Handle different resize directions
        if (direction.includes('e')) newWidth = Math.max(dimensions.minWidth, Math.min(dimensions.maxWidth, startWidth + deltaX));
        if (direction.includes('w')) {
          newWidth = Math.max(dimensions.minWidth, Math.min(dimensions.maxWidth, startWidth - deltaX));
          newX = Math.max(0, startX + (startWidth - newWidth));
        }
        if (direction.includes('s')) newHeight = Math.max(dimensions.minHeight, Math.min(dimensions.maxHeight, startHeight + deltaY));
        if (direction.includes('n')) {
          newHeight = Math.max(dimensions.minHeight, Math.min(dimensions.maxHeight, startHeight - deltaY));
          newY = Math.max(0, startY + (startHeight - newHeight));
        }

        updateDimensions({ width: newWidth, height: newHeight });
        updatePosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setDragging(false);
        dragRef.current = null;
      }
      if (isResizing) {
        setResizing(false);
        resizeRef.current = null;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, position, dimensions, viewport, updatePosition, updateDimensions, setDragging, setResizing]);

  if (!isVisible || !activeStrategy) {
    return null;
  }

  const content = (
    <Card
      ref={panelRef}
      className={cn(
        "fixed z-[9999] bg-gray-900/95 backdrop-blur-sm border-gray-700 shadow-2xl overflow-hidden transition-all duration-200",
        (isDragging || isResizing) && "select-none",
        isDragging && "cursor-grabbing",
        device === 'mobile' && mode === 'expanded' ? 
          "inset-4 w-auto h-auto" :
          "border-2 border-roulette-green/20"
      )}
      style={
        device === 'mobile' && mode === 'expanded' 
          ? {} 
          : {
              left: position.x,
              top: position.y,
              width: dimensions.width,
              height: dimensions.height,
            }
      }
    >
      {/* Resize Handles - Desktop Only */}
      {device !== 'mobile' && (
        <ResizeHandles onMouseDown={handleResizeStart} isResizing={isResizing} />
      )}

      {/* Header */}
      <FloatingHeader
        strategy={activeStrategy}
        mode={mode}
        onToggleMode={toggleMode}
        onClose={closePanel}
        onDragStart={handleDragStart}
        isDragging={isDragging}
      />

      {/* Content */}
      <div className="flex-1 overflow-hidden" style={{ height: `calc(100% - 40px)` }}>
        {mode === 'compact' ? (
          <CompactView strategy={activeStrategy} />
        ) : (
          <ExpandedView strategy={activeStrategy} />
        )}
      </div>

      {/* Status indicator */}
      {(isDragging || isResizing) && (
        <div className="absolute top-2 right-16 bg-gray-800 px-2 py-1 rounded text-xs text-white">
          {isDragging && (
            <span>Movendo... {Math.round(position.x)}x{Math.round(position.y)}</span>
          )}
          {isResizing && (
            <span>Redimensionando... {dimensions.width}x{dimensions.height}</span>
          )}
        </div>
      )}
    </Card>
  );

  return createPortal(content, document.body);
}