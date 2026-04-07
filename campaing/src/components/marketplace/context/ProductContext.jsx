import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within ProductProvider");
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get("http://localhost:8000/products");
      setProducts(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data || "Error fetching products");
      setLoading(false);
    }
  };

  const fetchProductDetails = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get(`http://localhost:8000/product/${id}`);
      setProductDetails(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data || "Error fetching product details");
      setLoading(false);
    }
  };

  const clearProductDetails = () => {
    setProductDetails(null);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const value = {
    products,
    productDetails,
    loading,
    error,
    fetchProducts,
    fetchProductDetails,
    clearProductDetails,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};
