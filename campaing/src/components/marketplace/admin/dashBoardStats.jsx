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
  color: #555;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.h3`
  font-size: 32px;
  font-weight: 800;
  margin: 8px 0 0;
  color: ${(props) => props.$color || "#1a1a2e"};
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.$bg || "#fff0f0"};
  color: ${(props) => props.$iconColor || "#bb0000"};
`;

const RecentOrdersSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  margin: 0;
  color: #1a1a1a;
  font-weight: 700;
`;

const SectionSubtitle = styled.div`
  font-size: 12px;
  color: #666;
  font-weight: 500;
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
    color: #333;
    font-weight: 700;
    font-size: 13px;
    background-color: #fafafa;
  }
  
  td {
    color: #1a1a1a;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) => {
    switch (props.$status) {
      case "pending":
        return "#fff3e0";
      case "completed":
        return "#e8f5e9";
      case "shipped":
        return "#e3f2fd";
      case "cancelled":
        return "#ffebee";
      case "processed":
        return "#e8eaf6";
      default:
        return "#f5f5f5";
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case "pending":
        return "#e65100";
      case "completed":
        return "#1b5e20";
      case "shipped":
        return "#01579b";
      case "cancelled":
        return "#c62828";
      case "processed":
        return "#1a237e";
      default:
        return "#555";
    }
  }};
`;

const CustomerName = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
`;

const CustomerEmail = styled.div`
  font-size: 11px;
  color: #666;
  font-weight: 500;
`;

const OrderNumber = styled.td`
  font-weight: 600;
  color: #1a1a1a;
`;

const TotalAmount = styled.td`
  font-weight: 700;
  color: #1a1a1a;
`;

const DateText = styled.td`
  color: #666;
  font-size: 12px;
  font-weight: 500;
`;

const NoOrdersCell = styled.td`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
`;

const DashboardStats = ({ stats, orders }) => {
  const pendingOrdersCount = orders.filter(order => order.status === "pending").length;
  
  const statItems = [
    {
      title: "Total Revenue",
      value: `KSH ${Number(stats.totalRevenue).toLocaleString()}`,
      icon: "Coins",
      color: "#16a34a",
      bg: "#f0fdf4"
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders || pendingOrdersCount || 0,
      icon: "Clock",
      color: "#ea580c",
      bg: "#fffbeb"
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: "ShoppingCart",
      color: "#dc2626",
      bg: "#fff1f2"
    },
    {
      title: "Low Stock Items",
      value: stats.lowStock,
      icon: "AlertTriangle",
      color: "#dc2626",
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
              <IconWrapper $bg={item.bg} $iconColor={item.color}>
                {React.createElement(Icons[item.icon], { size: 24 })}
              </IconWrapper>
            </StatHeader>
            <StatValue $color={item.color}>{item.value}</StatValue>
          </StatCard>
        ))}
      </StatsGrid>

      <RecentOrdersSection>
        <SectionHeader>
          <SectionTitle>Recent Campaign Orders</SectionTitle>
          <SectionSubtitle>Latest 5 entries</SectionSubtitle>
        </SectionHeader>
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
                <NoOrdersCell colSpan="5">
                  No recent orders available
                </NoOrdersCell>
              </tr>
            ) : (
              orders.slice(0, 5).map((order) => (
                <tr key={order.id}>
                  <OrderNumber>{order.order_number}</OrderNumber>
                  <td>
                    <CustomerName>{order.customer_name}</CustomerName>
                    <CustomerEmail>{order.customer_email}</CustomerEmail>
                  </td>
                  <TotalAmount>KSH {Number(order.total_amount).toLocaleString()}</TotalAmount>
                  <td>
                    <StatusBadge $status={order.status}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </StatusBadge>
                  </td>
                  <DateText>{new Date(order.created_at).toLocaleDateString()}</DateText>
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