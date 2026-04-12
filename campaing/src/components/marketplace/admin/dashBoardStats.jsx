import React from "react";
import styled from "styled-components";
import * as Icons from "lucide-react";

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const StatTitle = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0;
`;

const StatValue = styled.h3`
  font-size: 28px;
  font-weight: 700;
  margin: 8px 0 0;
  color: ${(props) => props.$color || "#1a1a2e"};
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: #fff0f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bb0000;
`;

const RecentOrdersSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  margin: 0 0 16px 0;
`;

const OrdersTable = styled.table`
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

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${(props) => {
    switch (props.$status) {
      case "pending":
        return "#fff3e0";
      case "completed":
        return "#e8f5e9";
      case "shipped":
        return "#e3f2fd";
      default:
        return "#f5f5f5";
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case "pending":
        return "#ed6c02";
      case "completed":
        return "#2e7d32";
      case "shipped":
        return "#0288d1";
      default:
        return "#666";
    }
  }};
`;

const DashboardStats = ({ stats, orders }) => {
  const statItems = [
    {
      title: "Total Revenue",
      value: `KSH ${Number(stats.totalRevenue).toLocaleString()}`,
      icon: "Coins",
      color: "#22c55e",
      bg: "#f0fdf4"
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders || 0,
      icon: "Clock",
      color: "#f59e0b",
      bg: "#fffbeb"
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: "ShoppingCart",
      color: "#bb0000",
      bg: "#fff1f2"
    },
    {
      title: "Low Stock Items",
      value: stats.lowStock,
      icon: "AlertTriangle",
      color: "#ef4444",
      bg: "#fef2f2"
    },
  ];

  return (
    <>
      <StatsGrid>
        {statItems.map((item, idx) => (
          <StatCard key={idx}>
            <StatHeader>
              <StatTitle>{item.title}</StatTitle>
              <IconWrapper style={{ background: item.bg, color: item.color }}>
                {React.createElement(Icons[item.icon], { size: 24 })}
              </IconWrapper>
            </StatHeader>
            <StatValue $color={item.color}>{item.value}</StatValue>
          </StatCard>
        ))}
      </StatsGrid>

      <RecentOrdersSection>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <SectionTitle style={{ margin: 0 }}>Recent Campaign Orders</SectionTitle>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Latest 5 entries</div>
        </div>
        <OrdersTable>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No recent orders available
                </td>
              </tr>
            ) : (
              orders.slice(0, 5).map((order) => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>
                    <div>{order.customer_name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{order.customer_email}</div>
                  </td>
                  <td>KSH {Number(order.total_amount).toLocaleString()}</td>
                  <td>
                    <StatusBadge $status={order.status}>
                      {order.status}
                    </StatusBadge>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </OrdersTable>
      </RecentOrdersSection>
    </>
  );
};

export default DashboardStats;
