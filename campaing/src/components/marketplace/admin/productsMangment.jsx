import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import * as Icons from "lucide-react";
import ProductModal from "./productModal";

const API_URL = "/api/v1/marketplace";

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
  color: #1a1a1a;
  font-weight: 600;
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
  font-weight: 500;
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
    color: #333;
    font-weight: 600;
    font-size: 13px;
    background-color: #fafafa;
  }
  
  td {
    color: #1a1a1a;
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
  transition: color 0.2s;

  &:hover {
    color: ${(props) => props.$hoverColor || "#000"};
  }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) => (props.$inStock ? "#e8f5e9" : "#ffebee")};
  color: ${(props) => (props.$inStock ? "#1b5e20" : "#c62828")};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const ProductName = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
`;

const ProductSubtitle = styled.div`
  font-size: 12px;
  color: #555;
  font-weight: 500;
`;

const ProductId = styled.td`
  color: #555;
  font-weight: 500;
`;

const ProductPrice = styled.td`
  color: #1a1a1a;
  font-weight: 600;
`;

const CategoryText = styled.span`
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  letter-spacing: 0.5px;
`;

const NoProductsCell = styled.td`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
`;

import { adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from "../components/api";

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
        await adminDeleteProduct(id);
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
        await adminUpdateProduct(editingProduct.id, productData);
      } else {
        await adminCreateProduct(productData);
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
            style={{ animation: "spin 1s linear infinite", color: "#bb0000" }}
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
                <NoProductsCell colSpan="8">
                  No products found
                </NoProductsCell>
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
                  <ProductId>#{product.id}</ProductId>
                  <td>
                    <ProductName>{product.name}</ProductName>
                    <ProductSubtitle>
                      {product.title?.substring(0, 40)}
                    </ProductSubtitle>
                  </td>
                  <ProductPrice>KSH {Number(product.price).toLocaleString()}</ProductPrice>
                  <td>
                    <CategoryText>{product.category}</CategoryText>
                  </td>
                  <td>
                    <StatusBadge $inStock={product.stock > 0}>
                      {product.stock} {product.stock === 1 ? 'unit' : 'units'} in stock
                    </StatusBadge>
                  </td>
                  <td>
                    <StatusBadge $inStock={product.status === "active"}>
                      {product.status === "active" ? "Active" : "Inactive"}
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