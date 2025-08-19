import React, { useRef, useEffect, useState } from 'react';

interface WhiteboardProps {
    isTeacher: boolean;
    isLive: boolean;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ isTeacher, isLive }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawing, setDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                setContext(ctx);
            }
        }
    }, []);

    const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isTeacher || !isLive || !context) return;
        const { offsetX, offsetY } = event.nativeEvent;
        context.beginPath();
        context.moveTo(offsetX, offsetY);
        setDrawing(true);
    };

    const stopDrawing = () => {
        if (!isTeacher || !isLive || !context) return;
        context.closePath();
        setDrawing(false);
    };

    const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawing || !isTeacher || !isLive || !context) return;
        const { offsetX, offsetY } = event.nativeEvent;
        context.lineTo(offsetX, offsetY);
        context.stroke();
    };

    const clearCanvas = () => {
        if (!isTeacher || !isLive || !context || !canvasRef.current) return;
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    return (
        <div className="flex flex-col h-full w-full">
            {!isLive ? (
                 <div className="flex-1 flex items-center justify-center bg-gray-100 text-center text-gray-500">
                    Whiteboard is offline.
                </div>
            ) : (
                <>
                <canvas
                    ref={canvasRef}
                    width={400} // Set dimensions appropriately
                    height={500}
                    className={`w-full h-full ${isTeacher ? 'cursor-crosshair bg-white' : 'cursor-not-allowed bg-gray-100'}`}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onMouseMove={draw}
                />
                {isTeacher && isLive && (
                    <button onClick={clearCanvas} className="p-2 bg-red-500 text-white font-semibold">Clear</button>
                )}
                </>
            )}
        </div>
    );
};

export default Whiteboard;