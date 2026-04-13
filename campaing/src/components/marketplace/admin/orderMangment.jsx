import React from "react";
import styled from "styled-components";
import * as Icons from "lucide-react";
import { updateOrderStatus } from "../components/api";

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  font-size: 18px;
  margin: 0 0 20px 0;
  color: #1a1a1a;
  font-weight: 600;
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
      case "processed":
        return "#e8eaf6";
      case "cancelled":
        return "#ffebee";
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
      case "processed":
        return "#1a237e";
      case "cancelled":
        return "#c62828";
      default:
        return "#333";
    }
  }};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #2874f0;

  &:hover {
    color: #1a5bbf;
  }
`;

const StatusSelect = styled.select`
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 12px;
  font-weight: 500;
  background: white;
  cursor: pointer;
  color: #333;
  
  &:hover {
    border-color: #2874f0;
  }
  
  &:focus {
    outline: none;
    border-color: #2874f0;
    box-shadow: 0 0 0 2px rgba(40, 116, 240, 0.1);
  }
`;

const CustomerName = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
`;

const CustomerEmail = styled.div`
  font-size: 11px;
  color: #555;
  font-weight: 500;
`;

const ShippingAddress = styled.td`
  font-size: 12px;
  max-width: 220px;
  color: #333;
  line-height: 1.4;
`;

const ContactText = styled.td`
  color: #333;
  font-weight: 500;
`;

const TotalAmount = styled.td`
  color: #1a1a1a;
  font-weight: 600;
`;

const DateText = styled.td`
  color: #555;
  font-size: 12px;
  font-weight: 500;
`;

const NoOrdersCell = styled.td`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 14px;
`;

const OrdersManagement = ({ orders, onRefresh }) => {
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  return (
    <Container>
      <Title>Orders Management</Title>
      <Table>
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Customer</th>
            <th>Contact</th>
            <th>Shipping Address</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <NoOrdersCell colSpan="8">
                No orders found
              </NoOrdersCell>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id}>
                <td style={{ color: "#1a1a1a", fontWeight: "500" }}>
                  {order.order_number}
                </td>
                <td>
                  <CustomerName>{order.customer_name}</CustomerName>
                  <CustomerEmail>{order.customer_email}</CustomerEmail>
                </td>
                <ContactText>{order.customer_phone || "N/A"}</ContactText>
                <ShippingAddress>
                  {order.address || "No address provided"}
                </ShippingAddress>
                <TotalAmount>
                  KSH {Number(order.total_amount).toLocaleString()}
                </TotalAmount>
                <td>
                  <StatusBadge $status={order.status}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </StatusBadge>
                </td>
                <DateText>
                  {new Date(order.created_at).toLocaleDateString()}
                </DateText>
                <td>
                  <StatusSelect 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processed">Processed</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </StatusSelect>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default OrdersManagement;