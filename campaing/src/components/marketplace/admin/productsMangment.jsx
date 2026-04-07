import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import * as Icons from "lucide-react";
import ProductModal from "./ProductModal";

const API_URL = "http://localhost:8000";

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 18px;
  margin: 0;
`;

const AddButton = styled.button`
  background: #bb0000;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background: #990000;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    color: #666;
    font-weight: 500;
    font-size: 13px;
  }
`;

const ProductImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: ${(props) => props.$color || "#666"};

  &:hover {
    color: ${(props) => props.$hoverColor || "#000"};
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) => (props.$inStock ? "#e8f5e9" : "#ffebee")};
  color: ${(props) => (props.$inStock ? "#2e7d32" : "#c62828")};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const ProductsManagement = ({ products, loading, onRefresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API_URL}/api/products/${id}`);
        onRefresh();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await axios.put(
          `${API_URL}/api/products/${editingProduct.id}`,
          productData,
        );
      } else {
        await axios.post(`${API_URL}/api/products`, productData);
      }
      onRefresh();
      setModalOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product");
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <Icons.Loader2
            size={32}
            style={{ animation: "spin 1s linear infinite" }}
          />
        </LoadingContainer>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Header>
          <Title>Products Management</Title>
          <AddButton onClick={handleAddProduct}>
            <Icons.Plus size={16} />
            Add Product
          </AddButton>
        </Header>

        <Table>
          <thead>
            <tr>
              <th>Image</th>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <ProductImage
                      src={product.image || "https://via.placeholder.com/50"}
                      alt={product.name}
                    />
                  </td>
                  <td>#{product.id}</td>
                  <td>
                    <strong>{product.name}</strong>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {product.title?.substring(0, 40)}
                    </div>
                  </td>
                  <td>₹{product.price}</td>
                  <td>
                    <span style={{ textTransform: "uppercase", fontSize: 12 }}>
                      {product.category}
                    </span>
                  </td>
                  <td>
                    <StatusBadge $inStock={product.stock > 0}>
                      {product.stock} in stock
                    </StatusBadge>
                  </td>
                  <td>
                    <StatusBadge $inStock={product.status === "active"}>
                      {product.status || "active"}
                    </StatusBadge>
                  </td>
                  <td>
                    <ActionButtons>
                      <IconButton
                        onClick={() => handleEditProduct(product)}
                        $color="#2874f0"
                        $hoverColor="#1a5bbf"
                      >
                        <Icons.Edit size={18} />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteProduct(product.id)}
                        $color="#ff4444"
                        $hoverColor="#cc0000"
                      >
                        <Icons.Trash2 size={18} />
                      </IconButton>
                    </ActionButtons>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Container>

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
    </>
  );
};

export default ProductsManagement;
