import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import axios from "axios";
import * as Icons from "lucide-react";

// Import separate components
import DashboardStats from "./dashBoardStats";
import ProductsManagement from "./productsMangment";
import OrdersManagement from "./orderMangment";
import CategoriesManagement from "./categoriesMangment";

import {
  getAllProducts,
  getAdminOrders,
  getAdminStats,
  updateOrderStatus
} from "../components/api";

const API_URL = "/api/v1/marketplace";

// Styled Components
const AdminContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
`;

const Sidebar = styled.aside`
  width: 260px;
  background: #1a1a2e;
  color: #ffffff;
  position: fixed;
  height: 100vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    transform: translateX(${(props) => (props.$isOpen ? "0" : "-100%")});
    transition: transform 0.3s ease;
    z-index: 1000;
  }
  
  /* Custom scrollbar for sidebar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`;

const SidebarHeader = styled.div`
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SidebarTitle = styled.h2`
  font-size: 20px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-weight: 700;

  span {
    font-size: 24px;
  }
`;

const NavMenu = styled.nav`
  padding: 20px 0;
`;

const NavItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 20px;
  background: ${(props) => (props.$active ? "#bb0000" : "transparent")};
  border: none;
  color: ${(props) => (props.$active ? "#ffffff" : "#e0e0e0")};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: ${(props) => (props.$active ? "600" : "500")};

  &:hover {
    background: ${(props) =>
    props.$active ? "#bb0000" : "rgba(255,255,255,0.1)"};
    color: #ffffff;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 260px;
  padding: 0px;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const TopBar = styled.div`
  background: #ffffff;
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const PageTitle = styled.h1`
  font-size: 24px;
  margin: 0;
  color: #1a1a2e;
  font-weight: 700;
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #1a1a2e;

  @media (max-width: 768px) {
    display: block;
  }
  
  &:hover {
    color: #bb0000;
  }
`;

const ViewStoreButton = styled(Link)`
  background: #bb0000;
  color: white;
  padding: 8px 20px;
  border-radius: 8px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #990000;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(187, 0, 0, 0.3);
  }
`;

const MobileOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${(props) => (props.$isOpen ? "block" : "none")};

  @media (min-width: 769px) {
    display: none;
  }
`;

const AdminPanel = () => {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { text: "Dashboard", icon: "LayoutDashboard", value: "dashboard" },
    { text: "Products", icon: "Package", value: "products" },
    { text: "Orders", icon: "ShoppingCart", value: "orders" },
    { text: "Categories", icon: "Tag", value: "categories" },
  ];

  useEffect(() => {
    fetchProducts();
    fetchOrdersAndStats();
  }, []);

  // Update stats when products change
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalProducts: products.length,
      lowStock: products.filter((p) => (p.stock ?? p.quantity ?? 0) < 10).length,
    }));
  }, [products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getAllProducts();
      const list = Array.isArray(response) ? response : (response?.data ?? []);
      setProducts(list);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersAndStats = async () => {
    try {
      const ordersRes = await getAdminOrders();
      const orderList = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.data ?? []);
      setOrders(orderList);

      const statsRes = await getAdminStats();
      const statsData = (statsRes?.data ?? statsRes) || {};

      setStats(prev => ({
        ...prev,
        totalOrders: statsData.totalOrders || orderList.length || 0,
        totalRevenue: statsData.totalRevenue || 0,
      }));
    } catch (error) {
      console.error("Error fetching orders and stats:", error);
    }
  };

  const renderContent = () => {
    switch (selectedTab) {
      case "products":
        return (
          <ProductsManagement
            products={products}
            loading={loading}
            onRefresh={fetchProducts}
          />
        );
      case "orders":
        return <OrdersManagement orders={orders} onRefresh={fetchOrdersAndStats} />;
      case "categories":
        return <CategoriesManagement products={products} />;
      default:
        return <DashboardStats stats={stats} orders={orders} />;
    }
  };

  const getIcon = (iconName) => {
    const Icon = Icons[iconName];
    return Icon ? <Icon size={20} /> : null;
  };

  return (
    <>
      <MobileOverlay
        $isOpen={sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />

      <AdminContainer>
        <Sidebar $isOpen={sidebarOpen}>
          <SidebarHeader>
            <SidebarTitle>
              <span>🛍️</span> Campaign Merch
            </SidebarTitle>
          </SidebarHeader>
          <NavMenu>
            {menuItems.map((item) => (
              <NavItem
                key={item.value}
                $active={selectedTab === item.value}
                onClick={() => {
                  setSelectedTab(item.value);
                  setSidebarOpen(false);
                }}
              >
                {getIcon(item.icon)}
                {item.text}
              </NavItem>
            ))}
          </NavMenu>
        </Sidebar>

        <MainContent>
          <TopBar>
            <MenuButton onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Icons.Menu size={24} />
            </MenuButton>
            <PageTitle>
              {menuItems.find((m) => m.value === selectedTab)?.text ||
                "Dashboard"}
            </PageTitle>
            <ViewStoreButton to="/marketplace">
              <Icons.ShoppingBag size={16} />
              View Store
            </ViewStoreButton>
          </TopBar>
          {renderContent()}
        </MainContent>
      </AdminContainer>
    </>
  );
};

export default AdminPanel;