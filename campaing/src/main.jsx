import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

const RootComponent = () => {
  useEffect(() => {
    // requestAnimationFrame waits for the very first browser paint
    const handle = requestAnimationFrame(() => {
      document.body.classList.add("loaded");
    });

    return () => cancelAnimationFrame(handle);
  }, []);

  return <App />;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
);
