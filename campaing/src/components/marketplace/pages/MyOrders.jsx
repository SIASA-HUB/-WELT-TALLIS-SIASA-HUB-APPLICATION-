// MyOrders.jsx — Real-time order tracking page fetching from backend
import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import {
  Package, Clock, CheckCircle, Truck, XCircle,
  RefreshCw, ArrowLeft, ShoppingBag, ChevronDown, ChevronUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../../../api/config";

const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const fadeUp = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;

const Wrapper = styled.div`max-width: 900px; margin: 0 auto; padding: 24px 20px; min-height: 100vh; background: #f8f9fa;`;
const BackBtn = styled(Link)`display: inline-flex; align-items: center; gap: 8px; color: #666; text-decoration: none; font-size: 14px; margin-bottom: 24px; transition: color 0.2s; &:hover { color: #1e3c72; }`;
const PageTitle = styled.h1`font-size: 28px; font-weight: 800; color: #1a1a1a; margin: 0 0 4px;`;
const PageSub = styled.p`color: #666; font-size: 14px; margin: 0 0 24px;`;
const SearchBar = styled.div`display: flex; gap: 12px; margin-bottom: 24px;`;
const SearchInput = styled.input`flex: 1; padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 12px; font-size: 14px; background: white; &:focus { outline: none; border-color: #1e3c72; box-shadow: 0 0 0 3px rgba(30,60,114,0.1); }`;
const RefreshBtn = styled.button`display: flex; align-items: center; gap: 6px; padding: 10px 16px; background: #1e3c72; color: white; border: none; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; &:hover { background: #152c54; } svg.spin { animation: ${spin} 1s linear infinite; }`;

const OrderCard = styled.div`background: white; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); margin-bottom: 16px; animation: ${fadeUp} 0.3s ease; overflow: hidden;`;
const OrderHeader = styled.div`display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; cursor: pointer; &:hover { background: #fafafa; }`;
const OrderLeft = styled.div`display: flex; flex-direction: column; gap: 4px;`;
const OrderNum = styled.div`font-family: monospace; font-size: 13px; font-weight: 700; color: #1e3c72;`;
const OrderDate = styled.div`font-size: 12px; color: #999;`;
const OrderRight = styled.div`display: flex; align-items: center; gap: 12px;`;
const OrderTotal = styled.div`font-size: 16px; font-weight: 800; color: #1a1a1a;`;

const STATUS_CONFIG = {
  pending:   { color: "#f59e0b", bg: "#fef3c7", icon: Clock,        label: "Pending" },
  processed: { color: "#3b82f6", bg: "#eff6ff", icon: RefreshCw,    label: "Processing" },
  shipped:   { color: "#8b5cf6", bg: "#ede9fe", icon: Truck,         label: "Shipped" },
  completed: { color: "#10b981", bg: "#d1fae5", icon: CheckCircle,  label: "Delivered" },
  cancelled: { color: "#ef4444", bg: "#fee2e2", icon: XCircle,       label: "Cancelled" },
};

const StatusBadge = styled.div`display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; background: ${p => p.$bg}; color: ${p => p.$color};`;

const OrderBody = styled.div`padding: 0 20px 20px;`;
const Divider = styled.hr`border: none; border-top: 1px solid #f0f0f0; margin: 0 0 16px;`;
const ItemsList = styled.div`display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;`;
const Item = styled.div`display: flex; gap: 12px; align-items: center;`;
const ItemImg = styled.img`width: 52px; height: 52px; object-fit: cover; border-radius: 8px; background: #f0f0f0;`;
const ItemInfo = styled.div`flex: 1;`;
const ItemName = styled.div`font-size: 13px; font-weight: 600; color: #1a1a1a;`;
const ItemMeta = styled.div`font-size: 12px; color: #999;`;
const ItemPrice = styled.div`font-size: 13px; font-weight: 700; color: #1e3c72;`;
const OrderMeta = styled.div`display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f8f9fa; border-radius: 12px; padding: 12px;`;
const MetaItem = styled.div`.label { font-size: 11px; color: #999; margin-bottom: 2px; text-transform: uppercase; } .value { font-size: 13px; font-weight: 600; color: #1a1a1a; }`;

const EmptyState = styled.div`text-align: center; padding: 60px 20px; color: #999;`;

const TrackForm = styled.div`background: white; border-radius: 16px; padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);`;
const TrackTitle = styled.p`font-size: 14px; font-weight: 600; color: #1a1a1a; margin: 0 0 10px;`;
const TrackInput = styled.input`flex: 1; padding: 10px 14px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; min-width: 0;`;
const TrackBtn = styled.button`padding: 10px 20px; background: #1e3c72; color: white; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;`;

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [trackNumber, setTrackNumber] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState("");

  const fetchOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
      const userId = userData.user_id;

      let fetched = [];

      if (userId) {
        // Authenticated user — fetch from backend
        const res = await axios.get(`${API.ORDERS}/user/${userId}`, { withCredentials: true });
        if (res.data.success) {
          fetched = res.data.data || [];
        }
      }

      // Merge with localStorage orders as fallback
      const localOrders = JSON.parse(localStorage.getItem("my_orders") || "[]");
      const backendIds = new Set(fetched.map(o => o.order_number));
      const mergedLocal = localOrders.filter(o => !backendIds.has(o.order_number));

      setOrders([...fetched, ...mergedLocal]);
    } catch (err) {
      // Fallback to localStorage
      const localOrders = JSON.parse(localStorage.getItem("my_orders") || "[]");
      setOrders(localOrders);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleTrack = async () => {
    if (!trackNumber.trim()) return;
    setTrackError("");
    setTrackedOrder(null);
    try {
      const res = await axios.get(`${API.ORDERS}/track/${trackNumber.trim()}`, { withCredentials: true });
      if (res.data.success) {
        setTrackedOrder(res.data.data);
      } else {
        setTrackError("Order not found. Check the order number.");
      }
    } catch {
      setTrackError("Order not found. Check the order number.");
    }
  };

  const formatDate = (d) => {
    if (!d) return "Unknown";
    return new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  };

  const renderOrderCard = (order, isTracked = false) => {
    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const StatusIcon = cfg.icon;
    const isOpen = expandedId === order.id || isTracked;
    const items = Array.isArray(order.items)
      ? order.items
      : typeof order.items === "string"
        ? JSON.parse(order.items)
        : [];

    return (
      <OrderCard key={order.id || order.order_number}>
        <OrderHeader onClick={() => !isTracked && setExpandedId(isOpen ? null : order.id)}>
          <OrderLeft>
            <OrderNum>📦 {order.order_number}</OrderNum>
            <OrderDate>{formatDate(order.created_at)} · {items.length} item{items.length !== 1 ? "s" : ""}</OrderDate>
          </OrderLeft>
          <OrderRight>
            <StatusBadge $color={cfg.color} $bg={cfg.bg}>
              <StatusIcon size={12} /> {cfg.label}
            </StatusBadge>
            <OrderTotal>KES {parseFloat(order.total_amount || 0).toLocaleString("en-KE")}</OrderTotal>
            {!isTracked && (isOpen ? <ChevronUp size={16} color="#999" /> : <ChevronDown size={16} color="#999" />)}
          </OrderRight>
        </OrderHeader>

        {isOpen && (
          <OrderBody>
            <Divider />
            <ItemsList>
              {items.map((item, i) => (
                <Item key={i}>
                  <ItemImg
                    src={item.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || "P")}&background=1e3c72&color=fff`}
                    alt={item.name}
                  />
                  <ItemInfo>
                    <ItemName>{item.name}</ItemName>
                    <ItemMeta>Qty: {item.quantity}{item.size ? ` · ${item.size}` : ""}</ItemMeta>
                  </ItemInfo>
                  <ItemPrice>KES {(parseFloat(item.price || 0) * (item.quantity || 1)).toLocaleString("en-KE")}</ItemPrice>
                </Item>
              ))}
            </ItemsList>
            <OrderMeta>
              <MetaItem><div className="label">Delivery To</div><div className="value">{order.address || "—"}</div></MetaItem>
              <MetaItem><div className="label">Payment</div><div className="value">{order.payment_method || "M-Pesa"}</div></MetaItem>
              <MetaItem><div className="label">Customer</div><div className="value">{order.customer_name || "—"}</div></MetaItem>
            </OrderMeta>
          </OrderBody>
        )}
      </OrderCard>
    );
  };

  return (
    <Wrapper>
      <BackBtn to="/marketplace"><ArrowLeft size={16} /> Back to Shop</BackBtn>
      <PageTitle>My Orders</PageTitle>
      <PageSub>Track and manage all your purchases</PageSub>

      {/* Track by order number */}
      <TrackForm>
        <TrackTitle>🔍 Track an order by number</TrackTitle>
        <div style={{ display: "flex", gap: 10 }}>
          <TrackInput
            placeholder="e.g. SH-ORD-ABC123"
            value={trackNumber}
            onChange={e => setTrackNumber(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleTrack()}
          />
          <TrackBtn onClick={handleTrack}>Track</TrackBtn>
        </div>
        {trackError && <p style={{ color: "#ef4444", margin: "8px 0 0", fontSize: 13 }}>{trackError}</p>}
      </TrackForm>

      {trackedOrder && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Tracked Order:</p>
          {renderOrderCard(trackedOrder, true)}
        </div>
      )}

      <SearchBar>
        <div style={{ flex: 1, fontWeight: 700, color: "#1a1a1a", display: "flex", alignItems: "center" }}>
          {loading ? "Loading..." : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}
        </div>
        <RefreshBtn onClick={() => fetchOrders(true)}>
          <RefreshCw size={14} className={refreshing ? "spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </RefreshBtn>
      </SearchBar>

      {loading ? (
        <EmptyState>
          <RefreshCw size={32} style={{ animation: `${spin} 1s linear infinite`, marginBottom: 12 }} />
          <p>Loading your orders...</p>
        </EmptyState>
      ) : orders.length === 0 ? (
        <EmptyState>
          <ShoppingBag size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
          <p style={{ fontWeight: 600, marginBottom: 8 }}>No orders yet</p>
          <p style={{ fontSize: 13, marginBottom: 20 }}>When you place orders, they'll appear here.</p>
          <RefreshBtn onClick={() => navigate("/marketplace")}>
            <ShoppingBag size={14} /> Browse Products
          </RefreshBtn>
        </EmptyState>
      ) : (
        orders.map(order => renderOrderCard(order))
      )}
    </Wrapper>
  );
};

export default MyOrders;
