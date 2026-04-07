import React, { useState, useEffect } from "react";
import styled from "styled-components";
import * as Icons from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8000";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #bb0000;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #bb0000;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #eee;
`;

const CancelButton = styled.button`
  padding: 8px 20px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: #e0e0e0;
  }
`;

const SaveButton = styled.button`
  padding: 8px 24px;
  background: #bb0000;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #990000;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SuccessMessage = styled.div`
  background: #e8f5e9;
  color: #2e7d32;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ImagePreview = styled.div`
  margin-top: 8px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;

  img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const UploadArea = styled.div`
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;

  &:hover {
    border-color: #bb0000;
    background: #fff5f5;
  }
`;

const UploadIcon = styled.div`
  margin-bottom: 8px;
  color: #bb0000;
`;

const UploadText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
`;

const FileInput = styled.input`
  display: none;
`;

const categories = [
  "caps",
  "tshirts",
  "hoodies",
  "posters",
  "badges",
  "stickers",
  "banners",
  "wristbands",
  "bags",
];

const ProductModal = ({ isOpen, onClose, onSave, product }) => {
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    price: "",
    cost: "",
    mrp: "",
    discount: "",
    category: "",
    stock: "",
    image: "",
    seller: "Campaign Store",
    featured: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        title: product.title || "",
        price: product.price || "",
        cost: product.cost || "",
        mrp: product.mrp || "",
        discount: product.discount || "",
        category: product.category || "",
        stock: product.stock || "",
        image: product.image || "",
        seller: product.seller || "Campaign Store",
        featured: product.featured || false,
      });
      setImagePreview(product.image || "");
    } else {
      setFormData({
        name: "",
        title: "",
        price: "",
        cost: "",
        mrp: "",
        discount: "",
        category: "",
        stock: "",
        image: "",
        seller: "Campaign Store",
        featured: false,
      });
      setImagePreview("");
      setSelectedFile(null);
    }
    setError("");
    setSuccess("");
  }, [product]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, and WEBP images are allowed");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setUploadingImage(true);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", "products");

    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.url) {
        setFormData((prev) => ({
          ...prev,
          image: response.data.url,
        }));
        setSuccess("Image uploaded successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const calculateDiscount = () => {
    if (formData.price && formData.mrp) {
      const price = parseFloat(formData.price);
      const mrp = parseFloat(formData.mrp);
      if (mrp > price) {
        const discountPercent = Math.round(((mrp - price) / mrp) * 100);
        return `${discountPercent}% off`;
      }
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const productData = {
        name: formData.name,
        title: formData.title,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost) || parseFloat(formData.price),
        mrp: parseFloat(formData.mrp) || parseFloat(formData.price),
        discount: calculateDiscount() || formData.discount,
        category: formData.category,
        stock: parseInt(formData.stock),
        image: formData.image,
        url: formData.image,
        detailUrl: formData.image,
        seller: formData.seller,
        featured: formData.featured,
        status: "active",
      };

      let response;
      if (product) {
        response = await axios.put(
          `${API_URL}/api/products/${product.id}`,
          productData,
        );
        setSuccess("Product updated successfully!");
      } else {
        response = await axios.post(`${API_URL}/api/products`, productData);
        setSuccess("Product created successfully!");
      }

      if (onSave) {
        onSave(response.data.data || productData);
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error saving product:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save product. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const discountPreview = calculateDiscount();

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {product ? "Edit Product" : "Add New Product"}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <Icons.X size={20} />
          </CloseButton>
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            {error && (
              <ErrorMessage>
                <Icons.AlertCircle size={16} />
                {error}
              </ErrorMessage>
            )}
            {success && (
              <SuccessMessage>
                <Icons.CheckCircle size={16} />
                {success}
              </SuccessMessage>
            )}

            <FormRow>
              <FormGroup>
                <Label>Product Name *</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="e.g., Campaign Cap"
                />
              </FormGroup>
              <FormGroup>
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.toUpperCase()}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Title</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Full product title for display (e.g., Official Campaign Cap - Adjustable)"
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>Selling Price (KES) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData({ ...formData, price: e.target.value });
                    if (formData.mrp) {
                      const discount = calculateDiscount();
                      if (discount) {
                        setFormData({
                          ...formData,
                          price: e.target.value,
                          discount,
                        });
                      } else {
                        setFormData({ ...formData, price: e.target.value });
                      }
                    }
                  }}
                  required
                  placeholder="e.g., 499"
                />
              </FormGroup>
              <FormGroup>
                <Label>MRP (KES)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.mrp}
                  onChange={(e) => {
                    setFormData({ ...formData, mrp: e.target.value });
                    if (formData.price) {
                      const discount = calculateDiscount();
                      if (discount) {
                        setFormData({ ...formData, discount });
                      }
                    }
                  }}
                  placeholder="e.g., 999"
                />
              </FormGroup>
            </FormRow>

            {discountPreview && (
              <FormGroup>
                <Label>Discount Preview</Label>
                <div style={{ fontSize: 14, color: "#388e3c" }}>
                  {discountPreview} (KES{" "}
                  {parseFloat(formData.mrp) - parseFloat(formData.price)} saved)
                </div>
              </FormGroup>
            )}

            <FormRow>
              <FormGroup>
                <Label>Stock Quantity *</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                  placeholder="e.g., 100"
                />
              </FormGroup>
              <FormGroup>
                <Label>Seller</Label>
                <Input
                  type="text"
                  value={formData.seller}
                  onChange={(e) =>
                    setFormData({ ...formData, seller: e.target.value })
                  }
                  placeholder="Campaign Store"
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Product Image</Label>
              <UploadArea
                onClick={() => document.getElementById("fileInput").click()}
              >
                <UploadIcon>
                  <Icons.Image size={32} />
                </UploadIcon>
                <UploadText>
                  {uploadingImage ? "Uploading..." : "Click to upload image"}
                </UploadText>
                <UploadText style={{ fontSize: 12, color: "#999" }}>
                  JPG, PNG, WEBP (Max 5MB)
                </UploadText>
              </UploadArea>
              <FileInput
                id="fileInput"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
              />
              {imagePreview && (
                <ImagePreview>
                  <img src={imagePreview} alt="Preview" />
                  <div>
                    <Icons.Image size={16} />
                    <span
                      style={{ fontSize: 12, color: "#666", marginLeft: 4 }}
                    >
                      Image uploaded
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setFormData({ ...formData, image: "" });
                        setSelectedFile(null);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ff4444",
                        cursor: "pointer",
                        fontSize: 12,
                        marginLeft: 12,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </ImagePreview>
              )}
            </FormGroup>

            <FormGroup>
              <Label>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  style={{ marginRight: 8 }}
                />
                Featured Product
              </Label>
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                Featured products appear on the homepage
              </div>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <SaveButton type="submit" disabled={loading || uploadingImage}>
              {loading ? (
                <>
                  <Icons.Loader2
                    size={16}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Icons.Save size={16} />
                  {product ? "Update Product" : "Create Product"}
                </>
              )}
            </SaveButton>
          </ModalFooter>
        </form>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ProductModal;
