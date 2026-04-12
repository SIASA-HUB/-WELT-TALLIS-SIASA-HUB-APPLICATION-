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

const StatusBadge = styled.span`
  padding: 4px 12px;
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
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 12px;
  background: white;
  cursor: pointer;
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
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                No orders found
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id}>
                <td>{order.order_number}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{order.customer_name}</div>
                  <div style={{ fontSize: "11px", color: "#666" }}>{order.customer_email}</div>
                </td>
                <td>{order.customer_phone || "N/A"}</td>
                <td>KSH {Number(order.total_amount).toLocaleString()}</td>
                <td>
                  <StatusBadge $status={order.status}>
                    {order.status}
                  </StatusBadge>
                </td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
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
