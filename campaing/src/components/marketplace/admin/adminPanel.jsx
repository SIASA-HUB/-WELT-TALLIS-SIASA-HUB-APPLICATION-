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

const API_URL = "http://localhost:8000";

// Styled Components
const AdminContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
`;

const Sidebar = styled.aside`
  width: 260px;
  background: #1a1a2e;
  color: #fff;
  position: fixed;
  height: 100vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    transform: translateX(${(props) => (props.$isOpen ? "0" : "-100%")});
    transition: transform 0.3s ease;
    z-index: 1000;
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
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;

  &:hover {
    background: ${(props) =>
      props.$active ? "#bb0000" : "rgba(255,255,255,0.1)"};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 260px;
  padding: 20px;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const TopBar = styled.div`
  background: #fff;
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
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;

  @media (max-width: 768px) {
    display: block;
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
  transition: background 0.2s;

  &:hover {
    background: #990000;
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
    fetchOrders();
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      // Mock orders - replace with actual API
      setOrders([
        {
          id: "ORD001",
          customer: "John Doe",
          total: 1299,
          status: "pending",
          date: "2024-03-20",
          items: 2,
        },
        {
          id: "ORD002",
          customer: "Jane Smith",
          total: 2499,
          status: "completed",
          date: "2024-03-19",
          items: 3,
        },
        {
          id: "ORD003",
          customer: "Bob Johnson",
          total: 599,
          status: "shipped",
          date: "2024-03-18",
          items: 1,
        },
      ]);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      const productsData = response.data.data || [];
      setStats({
        totalProducts: productsData.length,
        totalOrders: 156,
        totalRevenue: 45678,
        lowStock: productsData.filter((p) => p.stock < 10).length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
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
        return <OrdersManagement orders={orders} />;
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
