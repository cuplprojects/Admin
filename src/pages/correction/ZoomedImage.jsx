import React from 'react';

const ZoomedImage = ({ src }) => {
  // Constants based on your provided logic
  const x = 402;
  const y = 130.43;
  const zoomlevel = 1; // 2x zoom

  const originalWidth = 700; // Assuming the original image width is 700px
  const markedWidth = 114;
  const markedHeight = 136;
  const offset = 0;

  const scale = originalWidth / (markedWidth * zoomlevel);
  const width = markedWidth * zoomlevel ;
  const height = ((markedHeight + offset )* zoomlevel);
  const xa = x / scale* zoomlevel;
  const ya = y / scale - offset;

  return (
    <div className="m-auto" style={{ width, height, border: '2px solid red', overflow: 'hidden' }}>
      <img
        src={src}
        alt="Zoomed Image"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: `${xa}px ${ya}px`,
          position: 'relative',
          left: `-${xa}px`,
          top: `-${ya}px`,
        }}
      />
    </div>
  );
};

export default ZoomedImage;
