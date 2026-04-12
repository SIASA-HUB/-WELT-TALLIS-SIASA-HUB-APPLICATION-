import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  Share2,
  Download,
  Smartphone,
  X,
  CheckCircle,
  Copy,
} from "lucide-react";

const slideUp = keyframes`
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const ShareButton = styled.button`
  background: ${({ $isNav }) =>
    $isNav ? "transparent" : "linear-gradient(135deg, #ff5c01, #ff8c42)"};
  border: none;
  padding: ${({ $isNav }) => ($isNav ? "0" : "10px 20px")};
  border-radius: 40px;
  color: white;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  ${({ $isNav }) =>
    !$isNav &&
    `
    box-shadow: 0 4px 12px rgba(255, 92, 1, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(255, 92, 1, 0.4);
    }
  `}

  ${({ $isNav }) =>
    $isNav &&
    `
    svg {
      width: 22px;
      height: 22px;
      color: rgba(255, 255, 255, 0.8);
    }
  `}
  
  &:active {
    transform: translateY(0);
  }
`;

const InstallBanner = styled.div`
  position: fixed;
  bottom: 80px;
  left: 20px;
  right: 20px;
  background: linear-gradient(135deg, #1a1a2e, #0a0a0f);
  border-radius: 20px;
  padding: 16px;
  z-index: 10000;
  animation: ${slideUp} 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 92, 1, 0.3);
  backdrop-filter: blur(10px);

  @media (min-width: 768px) {
    left: auto;
    right: 20px;
    bottom: 20px;
    max-width: 350px;
  }
`;

const BannerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AppIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ff5c01, #ff8c42);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
`;

const TextContent = styled.div`
  flex: 1;

  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    color: white;
  }

  p {
    margin: 4px 0 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
  }
`;

const InstallButton = styled.button`
  background: linear-gradient(135deg, #ff5c01, #ff8c42);
  border: none;
  padding: 8px 16px;
  border-radius: 30px;
  color: white;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 8px rgba(255, 92, 1, 0.4);
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: white;
  }
`;

const Toast = styled.div`
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  z-index: 10001;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: ${slideUp} 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  @media (max-width: 640px) {
    white-space: normal;
    text-align: center;
    max-width: 80%;
  }
`;

const InstallTip = styled.div`
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  padding: 12px 20px;
  border-radius: 40px;
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 9999;
  animation: ${slideUp} 0.3s ease;
  white-space: nowrap;
  border: 1px solid rgba(255, 92, 1, 0.3);

  @media (max-width: 640px) {
    white-space: normal;
    text-align: center;
    max-width: 80%;
  }
`;

const ShareWithInstall = ({
  title = "SiasaHub",
  text = "Join me on SiasaHub! 🇰🇪 Battle leaders, vote, and make your voice heard!",
  url = window.location.href,
  isNav = false,
}) => {
  const [showInstallTip, setShowInstallTip] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState("");

  useEffect(() => {
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(
      navigator.userAgent,
    );
    setIsMobile(isMobileDevice);

    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setPlatform("ios");
    } else if (/Android/i.test(navigator.userAgent)) {
      setPlatform("android");
    } else {
      setPlatform("web");
    }

    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const hasInstalled = localStorage.getItem("pwa_installed");

    if (isStandalone || hasInstalled === "true") {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const wasClosed = localStorage.getItem("pwa_banner_closed");
      if (!wasClosed && !isInstalled) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    const wasShown = localStorage.getItem("pwa_banner_shown");
    if (!wasShown && !isStandalone && !deferredPrompt) {
      setTimeout(() => {
        setShowInstallBanner(true);
        localStorage.setItem("pwa_banner_shown", "true");
      }, 3000);
    }

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      localStorage.setItem("pwa_installed", "true");
      setShowInstallBanner(false);
      setShowToast(true);
      setToastMessage("🎉 SiasaHub installed! Ready to use offline.");
      setTimeout(() => setShowToast(false), 3000);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: text,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if (isMobile && !isInstalled) {
          setTimeout(() => {
            setShowInstallTip(true);
            setTimeout(() => setShowInstallTip(false), 5000);
          }, 1500);
        }
      } catch (error) {
        
        await copyToClipboard();
      }
    } else {
      await copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    const shareText = `${title}\n\n${text}\n\n📱 Install the app: ${url}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setToastMessage("✅ Link copied! Share with friends 📋");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      if (isMobile && !isInstalled) {
        setTimeout(() => {
          setShowInstallTip(true);
          setTimeout(() => setShowInstallTip(false), 5000);
        }, 1000);
      }
    } catch (err) {
      setToastMessage("❌ Failed to copy. Please try again.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstallBanner(false);
        localStorage.setItem("pwa_installed", "true");
        setToastMessage("🎉 Installing SiasaHub...");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      }
      setDeferredPrompt(null);
    } else {
      let manualInstructions = "";
      if (platform === "ios") {
        manualInstructions = "📱 Tap Share → Add to Home Screen";
      } else if (platform === "android") {
        manualInstructions = "📱 Tap Menu → Install App";
      } else {
        manualInstructions = "💻 Click the install icon in the address bar";
      }
      setToastMessage(manualInstructions);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
    setShowInstallBanner(false);
  };

  const closeBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem("pwa_banner_closed", "true");
  };

  if (isInstalled) {
    return (
      <ShareButton onClick={handleShare} $isNav={isNav}>
        <Share2 size={isNav ? 20 : 18} />
        {!isNav && "Share App"}
      </ShareButton>
    );
  }

  return (
    <>
      <ShareButton onClick={handleShare} $isNav={isNav}>
        <Share2 size={isNav ? 20 : 18} />
        {!isNav && "Share App"}
      </ShareButton>

      {showInstallBanner && (
        <InstallBanner>
          <BannerContent>
            <AppIcon>🇰🇪</AppIcon>
            <TextContent>
              <h4>Install SiasaHub App</h4>
              <p>Get faster access, offline support, and app-like experience</p>
            </TextContent>
            <InstallButton onClick={handleInstall}>Install</InstallButton>
            <CloseButton onClick={closeBanner}>
              <X size={16} />
            </CloseButton>
          </BannerContent>
        </InstallBanner>
      )}

      {showInstallTip && !isInstalled && (
        <InstallTip>
          <Smartphone size={16} />
          <span>
            {platform === "ios"
              ? "📱 Tap Share → Add to Home Screen"
              : platform === "android"
                ? "📱 Tap Menu → Install App"
                : "💻 Click install icon in address bar"}
          </span>
          <Download size={14} />
        </InstallTip>
      )}

      {showToast && (
        <Toast>
          {toastMessage.includes("✅") || toastMessage.includes("🎉") ? (
            <CheckCircle size={18} />
          ) : (
            <Copy size={18} />
          )}
          {toastMessage}
        </Toast>
      )}
    </>
  );
};

export default ShareWithInstall;
