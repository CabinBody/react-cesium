import React, { useRef, useState, useEffect } from 'react';



const FullscreenCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPosition, setStartPosition] = useState<{ x: number, y: number } | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ x: number, y: number } | null>(null);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = event.nativeEvent;
    setStartPosition({ x: offsetX, y: offsetY });
    setIsDrawing(true);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPosition) return;

    const { offsetX, offsetY } = event.nativeEvent;
    setCurrentPosition({ x: offsetX, y: offsetY });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setStartPosition(null);
    setCurrentPosition(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (context && startPosition && currentPosition) {
      context.clearRect(0, 0, canvas!.width, canvas!.height); // Clear the canvas

      const x = Math.min(startPosition.x, currentPosition.x);
      const y = Math.min(startPosition.y, currentPosition.y);
      const width = Math.abs(currentPosition.x - startPosition.x);
      const height = Math.abs(currentPosition.y - startPosition.y);

      context.strokeStyle = 'white';
      context.strokeRect(x, y, width, height);
    }
  }, [startPosition, currentPosition]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};

export default FullscreenCanvas;
