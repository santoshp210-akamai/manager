import ZoomInMap from '@mui/icons-material/ZoomInMap';
import ZoomOutMap from '@mui/icons-material/ZoomOutMap';
import * as React from 'react';

export const ZoomIcon = (props: any) => {
  const [zoomIn, setZoomIn] = React.useState<boolean>(props.zoomIn);

  const handleClick = () => {
    setZoomIn((zoomIn) => !zoomIn);
  };

  React.useEffect(() => {
    props.handleZoomToggle(zoomIn);
  }, [zoomIn]);

  const ToggleZoomer = () => {
    if (zoomIn) {
      return <ZoomInMap onClick={handleClick} />;
    }

    return <ZoomOutMap onClick={handleClick} />;
  };

  return (
    <div className={props.className}>
      <ToggleZoomer />
    </div>
  );
};
