import React, { useState } from "react";
import styled from "styled-components";
import * as Icons from "lucide-react";
import { updateOrderStatus } from "../components/api";

// ========== STYLED COMPONENTS ==========

const Container = styled.div`
  background: #ffffff;
  border-radius: 10px;
  padding: clamp(16px, 5vw, 32px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  margin-bottom: 40px;
`;

const Title = styled.h2`
  font-size: clamp(1.5rem, 6vw, 2rem);
  font-weight: 800;
  margin-bottom: 30px;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 15px;
  
  svg {
    color: #3b82f6;
    stroke-width: 2.5px;
  }
`;

// --- Responsive breakpoints ---
const DesktopView = styled.div`
  display: block;
  @media (max-width: 1100px) {
    display: none;
  }
`;

const MobileView = styled.div`
  display: none;
  @media (max-width: 1100px) {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
`;

// --- Desktop Table ---
const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  
  th {
    padding: 16px;
    text-align: left;
    color: #64748b;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
  }
  
  td {
    padding: 20px 16px;
    background: #ffffff;
    border-top: 1px solid #f1f5f9;
    border-bottom: 1px solid #f1f5f9;
    color: #1e293b;
    font-size: 1rem;
    
    &:first-child { border-left: 1px solid #f1f5f9; border-radius: 12px 0 0 12px; }
    &:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 12px 12px 0; }
  }

  tr:hover td {
    background: #f8fafc;
  }
`;

// --- Mobile Card ---
const OrderCard = styled.div`
  background: #ffffff;
  border: 2px solid #f1f5f9;
  border-radius: 20px;
  padding: 10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
`;

const Label = styled.div`
  font-size: 0.8rem;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

const Value = styled.div`
  font-size: 1rem;
  color: #1e293b;
  font-weight: 600;
  word-break: break-word;
`;

// --- Shared UI Elements ---
const StatusBadge = styled.span`
  padding: 6px 14px;
  border-radius: 40px;
  font-size: 0.85rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  background: ${({ $status }) => {
    if ($status === "pending") return "#fff7ed";
    if ($status === "completed") return "#f0fdf4";
    if ($status === "cancelled") return "#fef2f2";
    return "#eff6ff";
  }};
  color: ${({ $status }) => {
    if ($status === "pending") return "#c2410c";
    if ($status === "completed") return "#15803d";
    if ($status === "cancelled") return "#b91c1c";
    return "#1d4ed8";
  }};
`;

const StatusSelect = styled.select`
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  background: #f8fafc;
  cursor: pointer;
  
  &:focus {
    border-color: #3b82f6;
    outline: none;
  }
`;

const PriceTag = styled.div`
  font-size: 1.3rem;
  font-weight: 900;
  color: #0f172a;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 14px;
  margin-top: 12px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ItemImage = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
  background: #e2e8f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 800;
  font-size: 1rem;
  color: #0f172a;
  margin-bottom: 6px;
`;

const ItemMeta = styled.div`
  font-size: 0.9rem;
  color: #475569;
  font-weight: 500;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const ExpandButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background: white;
  color: #1d4ed8;
  font-weight: 700;
  font-size: 0.95rem;
  margin: 10px 0;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #eff6ff;
    border-color: #3b82f6;
  }
`;

// ========== MAIN COMPONENT ==========

const OrdersManagement = ({ orders, onRefresh }) => {
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      onRefresh?.();
    } catch (err) {
      alert("Error updating status");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!orders || orders.length === 0) {
    return (
      <Container>
        <Title><Icons.PackageSearch size={32} /> Orders Management</Title>
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b", fontSize: "1.2rem" }}>
          No orders available.
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Title>
        <Icons.ShoppingBag size={32} />
        Orders Management
      </Title>

      {/* DESKTOP TABLE */}
      <DesktopView>
        <StyledTable>
          <thead>
            <tr>
              <th>Order Details</th>
              <th>Customer</th>
              <th>Shipping</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <React.Fragment key={order.id}>
                <tr>
                  <td>
                    <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>#{order.order_number}</div>
                    <div style={{ fontSize: "1.2rem", color: "#64748b" }}>{formatDate(order.created_at)}</div>
                    <button
                      onClick={() => toggle(order.id)}
                      style={{ border: "none", background: "none", color: "#3b82f6", cursor: "pointer", padding: "5px 0", fontWeight: 700, fontSize: "0.9rem" }}
                    >
                      {expanded[order.id] ? "Hide Items ↑" : `View ${order.items?.length} Items ↓`}
                    </button>
                  </td>
                  <td>
                    <Value style={{ fontWeight: 700 }}>{order.customer_name}</Value>
                    <div style={{ fontSize: "1.2rem", color: "#64748b" }}>{order.customer_email}</div>
                  </td>
                  <td>
                    <div>📞 {order.customer_phone || "No Phone"}</div>
                    <div style={{ fontSize: "1.2rem", color: "#64748b", maxWidth: "220px", marginTop: "6px" }}>📍 {order.address || "No address"}</div>
                  </td>
                  <td><PriceTag>KES {Number(order.total_amount).toLocaleString()}</PriceTag></td>
                  <td><StatusBadge $status={order.status}>{order.status}</StatusBadge></td>
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
                {expanded[order.id] && (
                  <tr>
                    <td colSpan="6" style={{ padding: "0 16px 20px 16px", background: "transparent" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
                        {order.items?.map((item, i) => (
                          <ItemRow key={i}>
                            {item.product?.image && (
                              <ItemImage src={item.product.image} alt={item.product.name} />
                            )}
                            <ItemInfo>
                              <ItemName>{item.product?.name || item.name || "Product"}</ItemName>
                              <ItemMeta>
                                <span>Qty: {item.quantity}</span>
                                <span>Unit: KES {Number(item.price || item.unit_price).toLocaleString()}</span>
                                <span>Subtotal: KES {Number((item.price || item.unit_price) * item.quantity).toLocaleString()}</span>
                              </ItemMeta>
                            </ItemInfo>
                          </ItemRow>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </StyledTable>
      </DesktopView>

      {/* MOBILE CARDS */}
      <MobileView>
        {orders.map(order => (
          <OrderCard key={order.id}>
            <CardRow>
              <div style={{ flex: 2 }}>
                <Label>Order #</Label>
                <Value style={{ fontFamily: "monospace", fontSize: "1.2rem", fontWeight: 800 }}>#{order.order_number}</Value>
                <div style={{ fontSize: "1rem", color: "#64748b", marginTop: 4 }}>{formatDate(order.created_at)}</div>
              </div>
              <StatusBadge $status={order.status}>{order.status}</StatusBadge>
            </CardRow>

            <CardRow>
              <div style={{ flex: 1 }}>
                <Label>Customer</Label>
                <Value style={{ fontWeight: 700 }}>{order.customer_name}</Value>
                <div style={{ fontSize: "1.2rem", color: "#64748b" }}>{order.customer_email}</div>
              </div>
              <div style={{ flex: 1, textAlign: "right" }}>
                <Label>Total</Label>
                <PriceTag>KES {Number(order.total_amount).toLocaleString()}</PriceTag>
              </div>
            </CardRow>

            <div style={{ marginBottom: 16 }}>
              <Label>Address & Phone</Label>
              <Value>📞 {order.customer_phone || "N/A"}</Value>
              <Value style={{ fontSize: "0.9rem", marginTop: 4 }}>📍 {order.address || "No address"}</Value>
            </div>

            <ExpandButton onClick={() => toggle(order.id)}>
              {expanded[order.id] ? "Hide Items" : `Show ${order.items?.length || 0} Items`}
            </ExpandButton>

            {expanded[order.id] && order.items?.map((item, i) => (
              <ItemRow key={i}>
                {item.product?.image && (
                  <ItemImage src={item.product.image} alt={item.product.name} />
                )}
                <ItemInfo>
                  <ItemName>{item.product?.name || item.name || "Product"}</ItemName>
                  <ItemMeta>
                    <span>Qty: {item.quantity}</span>
                    <span>Unit: KES {Number(item.price || item.unit_price).toLocaleString()}</span>
                  </ItemMeta>
                  <div style={{ fontWeight: 700, marginTop: 6, fontSize: "0.9rem" }}>
                    Subtotal: KES {Number((item.price || item.unit_price) * item.quantity).toLocaleString()}
                  </div>
                </ItemInfo>
              </ItemRow>
            ))}

            <div style={{ marginTop: 20 }}>
              <Label>Update Status</Label>
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
            </div>
          </OrderCard>
        ))}
      </MobileView>
    </Container>
  );
};

export default OrdersManagement;