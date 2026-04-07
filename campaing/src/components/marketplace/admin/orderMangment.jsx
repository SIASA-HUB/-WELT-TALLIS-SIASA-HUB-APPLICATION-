import React from "react";
import styled from "styled-components";
import * as Icons from "lucide-react";

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

const OrdersManagement = ({ orders }) => {
  return (
    <Container>
      <Title>Orders Management</Title>
      <Table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
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
                <td>#{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.items} items</td>
                <td>₹{order.total}</td>
                <td>
                  <StatusBadge $status={order.status}>
                    {order.status}
                  </StatusBadge>
                </td>
                <td>{order.date}</td>
                <td>
                  <ActionButton title="View Details">
                    <Icons.Eye size={18} />
                  </ActionButton>
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
