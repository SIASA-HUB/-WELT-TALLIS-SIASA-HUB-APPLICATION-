import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { getMarketplaceCategories, createCategory, deleteCategory } from "../components/api";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiTrash2, FiEdit2, FiImage } from "react-icons/fi";

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  font-size: 20px;
  margin: 0;
  color: #1a1a1a;
  font-weight: 700;
`;

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #000;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  color: #666;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid #eaeaea;
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid #eaeaea;
  vertical-align: middle;
`;

const ActionBtn = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.danger ? '#dc3545' : '#666'};
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.danger ? 'rgba(220,53,69,0.1)' : '#f0f0f0'};
    color: ${props => props.danger ? '#c82333' : '#000'};
  }
`;

const CatImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// Simple Modal Component
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: #000;
  }
`;

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getMarketplaceCategories();
      setCategories(data);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return toast.error("Category name is required");
    
    try {
      await createCategory({ name: newCatName });
      toast.success("Category added!");
      setNewCatName("");
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to create category");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? Products in this category will become unassigned.")) return;
    try {
      await deleteCategory(id);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };

  return (
    <Container>
      <Header>
        <Title>Categories Management</Title>
        <AddBtn onClick={() => setShowModal(true)}>
          <FiPlus /> Add Category
        </AddBtn>
      </Header>

      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Image</Th>
              <Th>Name</Th>
              <Th>Products</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id || cat.name}>
                <Td>
                  <CatImage>
                    {cat.image ? <img src={cat.image} alt={cat.name} /> : <FiImage color="#ccc" />}
                  </CatImage>
                </Td>
                <Td>
                  <strong>{cat.name}</strong>
                  {cat.slug && <div style={{fontSize: '12px', color: '#888'}}>{cat.slug}</div>}
                </Td>
                <Td>{cat.actual_product_count || cat.count || 0}</Td>
                <Td>
                  <span style={{
                    padding: '4px 8px', 
                    background: cat.status === 'active' ? '#e6f4ea' : '#f8f9fa',
                    color: cat.status === 'active' ? '#1e8e3e' : '#666',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {cat.status || 'active'}
                  </span>
                </Td>
                <Td>
                  <ActionBtn title="Edit"><FiEdit2 /></ActionBtn>
                  <ActionBtn danger title="Delete" onClick={() => handleDelete(cat.id)}>
                    <FiTrash2 />
                  </ActionBtn>
                </Td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <Td colSpan="5" style={{textAlign: 'center', color: '#888'}}>No categories found</Td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      <AnimatePresence>
        {showModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <ModalContent
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h3>Add New Category</h3>
              <form onSubmit={handleAdd}>
                <Input 
                  autoFocus
                  placeholder="Category Name (e.g. Wristbands)" 
                  value={newCatName} 
                  onChange={e => setNewCatName(e.target.value)} 
                />
                <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
                  <AddBtn type="button" style={{background: '#f0f0f0', color: '#000'}} onClick={() => setShowModal(false)}>
                    Cancel
                  </AddBtn>
                  <AddBtn type="submit">Save Category</AddBtn>
                </div>
              </form>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

    </Container>
  );
};

export default CategoriesManagement;