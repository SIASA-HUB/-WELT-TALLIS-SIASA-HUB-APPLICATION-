// src/context/CountyContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const CountyContext = createContext();

export const useCounty = () => {
  const context = useContext(CountyContext);
  if (!context) {
    throw new Error("useCounty must be used within a CountyProvider");
  }
  return context;
};

export const CountyProvider = ({ children }) => {
  // 1. Initial Detection from Local Storage
  const [selectedCounty, setSelectedCounty] = useState(() => {
    return localStorage.getItem("user_county") || "";
  });

  // 2. Synchronize State if LocalStorage changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      const storedCounty = localStorage.getItem("user_county");
      if (storedCounty !== selectedCounty) {
        setSelectedCounty(storedCounty || "");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [selectedCounty]);

  // 3. Simple Update Function
  const updateCounty = (county) => {
    setSelectedCounty(county);
    localStorage.setItem("user_county", county);
    console.log(`📍 County updated to: ${county}`);
  };

  // Static list for UI components (Selects, Filters, etc.)
  const availableCounties = [
    "Mombasa",
    "Kwale",
    "Kilifi",
    "Tana River",
    "Lamu",
    "Taita Taveta",
    "Garissa",
    "Wajir",
    "Mandera",
    "Marsabit",
    "Isiolo",
    "Meru",
    "Tharaka Nithi",
    "Embu",
    "Kitui",
    "Machakos",
    "Makueni",
    "Nyandarua",
    "Nyeri",
    "Kirinyaga",
    "Murang'a",
    "Kiambu",
    "Turkana",
    "West Pokot",
    "Samburu",
    "Trans Nzoia",
    "Uasin Gishu",
    "Elgeyo Marakwet",
    "Nandi",
    "Baringo",
    "Laikipia",
    "Nakuru",
    "Narok",
    "Kajiado",
    "Kericho",
    "Bomet",
    "Kakamega",
    "Vihiga",
    "Bungoma",
    "Busia",
    "Siaya",
    "Kisumu",
    "Homa Bay",
    "Migori",
    "Kisii",
    "Nyamira",
    "Nairobi",
  ];

  return (
    <CountyContext.Provider
      value={{
        selectedCounty,
        updateCounty,
        availableCounties,
        hasSelectedCounty: !!selectedCounty,
      }}
    >
      {children}
    </CountyContext.Provider>
  );
};
