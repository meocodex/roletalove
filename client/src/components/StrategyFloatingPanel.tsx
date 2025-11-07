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
  Activity
} from 'lucide-react';
import { useStrategyFloatingPanel } from '@/hooks/useStrategyFloatingPanel';
import { CompactView } from './strategy-floating/CompactView';
import { ExpandedView } from './strategy-floating/ExpandedView';
import { cn } from '@/lib/utils';

interface DragHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  className?: string;
}

function DragHandle({ onMouseDown, className }: DragHandleProps) {
  return (
    <div
      className={cn(
        "absolute top-0 left-0 right-0 h-8 flex items-center justify-center cursor-move bg-gray-800/90 rounded-t-lg border-b border-gray-700",
        className
      )}
      onMouseDown={onMouseDown}
    >
      <GripHorizontal className="w-4 h-4 text-gray-400" />
    </div>
  );
}

interface FloatingHeaderProps {
  strategy: any;
  mode: 'compact' | 'expanded';
  onToggleMode: () => void;
  onClose: () => void;
}

function FloatingHeader({ strategy, mode, onToggleMode, onClose }: FloatingHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/95 border-b border-gray-700">
      <div className="flex items-center gap-2 flex-1 min-w-0">
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
          className="h-7 w-7 p-0 hover:bg-gray-700"
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
          className="h-7 w-7 p-0 hover:bg-gray-700 text-red-400 hover:text-red-300"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

export default function StrategyFloatingPanel() {
  const {
    isVisible,
    mode,
    position,
    dimensions,
    activeStrategy,
    device,
    isDragging,
    closePanel,
    toggleMode,
    updatePosition,
    setDragging,
  } = useStrategyFloatingPanel();

  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; startMouseX: number; startMouseY: number } | null>(null);

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (device === 'mobile') return; // No dragging on mobile
    
    e.preventDefault();
    setDragging(true);
    
    dragRef.current = {
      startX: position.x,
      startY: position.y,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
    };
  };

  useEffect(() => {
    if (!isDragging || device === 'mobile') return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;

      const deltaX = e.clientX - dragRef.current.startMouseX;
      const deltaY = e.clientY - dragRef.current.startMouseY;

      const newX = Math.max(0, Math.min(
        window.innerWidth - dimensions.width,
        dragRef.current.startX + deltaX
      ));

      const newY = Math.max(0, Math.min(
        window.innerHeight - dimensions.height,
        dragRef.current.startY + deltaY
      ));

      updatePosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setDragging(false);
      dragRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position, dimensions, device, updatePosition, setDragging]);

  // Auto-reposition when dimensions change
  useEffect(() => {
    const maxX = window.innerWidth - dimensions.width;
    const maxY = window.innerHeight - dimensions.height;
    
    if (position.x > maxX || position.y > maxY) {
      updatePosition({
        x: Math.min(position.x, Math.max(0, maxX)),
        y: Math.min(position.y, Math.max(0, maxY)),
      });
    }
  }, [dimensions, position, updatePosition]);

  if (!isVisible || !activeStrategy) {
    return null;
  }

  const content = (
    <Card
      ref={panelRef}
      className={cn(
        "fixed z-[9999] bg-gray-900/95 backdrop-blur-sm border-gray-700 shadow-2xl overflow-hidden transition-all duration-200",
        isDragging && "cursor-move",
        device === 'mobile' && mode === 'expanded' ? 
          "inset-4 w-auto h-auto" : // Mobile fullscreen with padding
          ""
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
      {/* Drag Handle - Desktop Only */}
      {device !== 'mobile' && (
        <DragHandle onMouseDown={handleMouseDown} />
      )}

      {/* Header */}
      <div className={cn(device !== 'mobile' ? "mt-8" : "")}>
        <FloatingHeader
          strategy={activeStrategy}
          mode={mode}
          onToggleMode={toggleMode}
          onClose={closePanel}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {mode === 'compact' ? (
          <CompactView strategy={activeStrategy} />
        ) : (
          <ExpandedView strategy={activeStrategy} />
        )}
      </div>
    </Card>
  );

  // Render in portal for proper stacking
  return createPortal(content, document.body);
}