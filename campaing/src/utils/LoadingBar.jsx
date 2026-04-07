// src/utils/LoadingBar.jsx
import React, { useRef, forwardRef, useImperativeHandle } from "react";
import LoadingBar from "react-top-loading-bar";

const AppLoadingBar = forwardRef((props, ref) => {
  const loadingBarRef = useRef(null);

  useImperativeHandle(ref, () => ({
    continuousStart: (progress) =>
      loadingBarRef.current?.continuousStart(progress),
    staticStart: (progress) => loadingBarRef.current?.staticStart(progress),
    complete: () => loadingBarRef.current?.complete(),
  }));

  return (
    <LoadingBar
      // Vibrant Orange looks much more "active" for loading
      color="#ff4500"
      ref={loadingBarRef}
      height={3.5} // Slightly thicker for better visibility
      shadow={true}
      shadowStyle={{
        boxShadow: "0 0 10px #ff4500",
      }}
      waitingTime={400}
      {...props}
    />
  );
});

AppLoadingBar.displayName = "AppLoadingBar";
export default AppLoadingBar;
