import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://your-api.com");

export default function useUserPresence(userId) {
  const lastActivity = useRef(Date.now());

  useEffect(() => {
    const updateActivity = () => {
      lastActivity.current = Date.now();
    };

    ["mousemove", "keydown", "scroll", "touchstart"].forEach((event) =>
      window.addEventListener(event, updateActivity),
    );

    const interval = setInterval(() => {
      if (Date.now() - lastActivity.current < 60000) {
        socket.emit("user-active", { userId });
      }
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [userId]);
}
