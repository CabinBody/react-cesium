import React, { useState } from 'react';
import './index.less';

interface Popup {
  x: number;
  y: number;
}

const ClickPopup = () => {
  const [popup, setPopup] = useState<Popup | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setPopup({ x: event.clientX, y: event.clientY });
  };

  return (
    <div className="ClickPopup" onClick={handleClick} style={{ height: '100vh' }}>
      {popup && (
        <div
          style={{
            position: 'absolute',
            top: popup.y,
            left: popup.x,
            backgroundColor: 'white',
            border: '1px solid black',
            padding: '10px',
          }}
        >
          你好
        </div>
      )}
    </div>
  );
};

export default ClickPopup;
