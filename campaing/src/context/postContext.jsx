import React, { createContext, useState, useContext } from "react";

const PostContext = createContext();

export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePost must be used within a PostProvider");
  }
  return context;
};

export const PostProvider = ({ children }) => {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const openCreatePostModal = () => setIsCreatePostModalOpen(true);
  const closeCreatePostModal = () => setIsCreatePostModalOpen(false);

  const handlePostCreated = (newPost) => {
    console.log("Global post created:", newPost);
    // You can add global logic here, like refreshing posts across components
    closeCreatePostModal();
  };

  return (
    <PostContext.Provider
      value={{
        isCreatePostModalOpen,
        openCreatePostModal,
        closeCreatePostModal,
        handlePostCreated,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};
