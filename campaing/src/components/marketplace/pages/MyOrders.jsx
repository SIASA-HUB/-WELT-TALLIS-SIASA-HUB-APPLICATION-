// MyOrders.jsx — Shopping history at /account/history
// SEO-optimized with Helmet, slug-based product links, and real-time backend fetch

import React, { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import styled, { keyframes } from "styled-components";
import {
  Package, Clock, CheckCircle, Truck, XCircle,
  RefreshCw, ArrowLeft, ShoppingBag, ChevronDown, ChevronUp, ExternalLink,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../api/api";
import API from "../../../api/config";

const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const fadeUp = keyframes`from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); }`;

const Wrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 20px 80px;
  min-height: 100vh;
  background: #f8f9fa;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
`;

const BackBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #666;
  text-decoration: none;
  font-size: 14px;
  padding: 8px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  transition: all 0.2s;
  &:hover { color: #1e3c72; border-color: #1e3c72; }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 4px;
`;

const PageSub = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0 0 24px;
`;

const ToolBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
`;

const OrderCount = styled.div`
  font-weight: 700;
  color: #1a1a1a;
  font-size: 15px;
`;

const RefreshBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #1e3c72;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #152c54; }
  svg.spin { animation: ${spin} 1s linear infinite; }
`;

const TrackForm = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
`;

const TrackTitle = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 10px;
`;

const TrackInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  min-width: 0;
  &:focus { outline: none; border-color: #1e3c72; }
`;

const TrackBtn = styled.button`
  padding: 10px 20px;
  background: #1e3c72;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: #152c54; }
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  margin-bottom: 16px;
  animation: ${fadeUp} 0.3s ease;
  overflow: hidden;
`;

const OrderHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  cursor: pointer;
  user-select: none;
  &:hover { background: #fafafa; }
`;

const OrderLeft = styled.div`display: flex; flex-direction: column; gap: 4px;`;
const OrderNum = styled.div`font-family: monospace; font-size: 13px; font-weight: 700; color: #1e3c72;`;
const OrderDate = styled.div`font-size: 12px; color: #999;`;
const OrderRight = styled.div`display: flex; align-items: center; gap: 12px;`;
const OrderTotal = styled.div`font-size: 16px; font-weight: 800; color: #1a1a1a;`;

const STATUS_CONFIG = {
  pending:   { color: "#f59e0b", bg: "#fef3c7", icon: Clock,       label: "Pending" },
  processed: { color: "#3b82f6", bg: "#eff6ff", icon: RefreshCw,   label: "Processing" },
  shipped:   { color: "#8b5cf6", bg: "#ede9fe", icon: Truck,        label: "Shipped" },
  completed: { color: "#10b981", bg: "#d1fae5", icon: CheckCircle, label: "Delivered" },
  cancelled: { color: "#ef4444", bg: "#fee2e2", icon: XCircle,      label: "Cancelled" },
};

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  background: ${p => p.$bg};
  color: ${p => p.$color};
`;

const OrderBody = styled.div`padding: 0 20px 20px;`;
const Divider = styled.hr`border: none; border-top: 1px solid #f0f0f0; margin: 0 0 16px;`;
const ItemsList = styled.div`display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;`;
const Item = styled.div`display: flex; gap: 12px; align-items: center;`;

const ItemImg = styled.img`
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 8px;
  background: #f0f0f0;
  flex-shrink: 0;
`;

const ItemInfo = styled.div`flex: 1;`;
const ItemName = styled.div`font-size: 13px; font-weight: 600; color: #1a1a1a;`;
const ItemMeta = styled.div`font-size: 12px; color: #999;`;
const ItemPrice = styled.div`font-size: 13px; font-weight: 700; color: #1e3c72;`;

const SlugLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #1e3c72;
  text-decoration: none;
  margin-top: 4px;
  &:hover { text-decoration: underline; }
  opacity: 0.7;
  transition: opacity 0.2s;
  &:hover { opacity: 1; }
`;

const OrderMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px;
  @media (max-width: 600px) { grid-template-columns: 1fr 1fr; }
`;

const MetaItem = styled.div`
  .label { font-size: 11px; color: #999; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
  .value { font-size: 13px; font-weight: 600; color: #1a1a1a; word-break: break-word; }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;
`;

const BrowseBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: #1e3c72;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  transition: background 0.2s;
  &:hover { background: #152c54; }
`;

// ─── Helper ──────────────────────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return "Unknown date";
  return new Date(d).toLocaleDateString("en-KE", {
    day: "numeric", month: "short", year: "numeric"
  });
};

const parseItems = (items) => {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  try { return JSON.parse(items); } catch { return []; }
};

// Get user_id from all possible storage locations
const getStoredUserId = () => {
  try {
    // Primary: user_data (set by useAuth login fix)
    const ud = localStorage.getItem("user_data");
    if (ud) {
      const parsed = JSON.parse(ud);
      if (parsed.user_id) return parsed.user_id;
    }
    // Fallback: legacy key
    const legacy = localStorage.getItem("userData");
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (parsed.user_id) return parsed.user_id;
    }
    return null;
  } catch { return null; }
};

// ─── Component ───────────────────────────────────────────────────────────────
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
      const userId = getStoredUserId();
      let fetched = [];

      if (userId) {
        // Authenticated path — use the shared api instance (sends Bearer token)
        const res = await api.get(`/orders/user/${userId}`);
        if (res?.success || res?.data) {
          fetched = res.data || res || [];
        }
      }

      // Merge with localStorage guest orders as fallback
      const localOrders = parseItems(localStorage.getItem("my_orders"));
      const backendIds = new Set(fetched.map(o => o.order_number));
      const mergedLocal = localOrders.filter(o => !backendIds.has(o.order_number));

      setOrders([...fetched, ...mergedLocal]);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      // Fallback to localStorage
      const localOrders = parseItems(localStorage.getItem("my_orders"));
      setOrders(localOrders);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleTrack = async () => {
    if (!trackNumber.trim()) return;
    setTrackError(""); setTrackedOrder(null);
    try {
      const res = await api.get(`/orders/track/${trackNumber.trim()}`);
      if (res?.success && res.data) {
        setTrackedOrder(res.data);
      } else {
        setTrackError("Order not found. Check the order number.");
      }
    } catch {
      setTrackError("Order not found. Check the order number.");
    }
  };

  const renderOrderCard = (order, isTracked = false) => {
    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
    const StatusIcon = cfg.icon;
    const isOpen = expandedId === order.id || isTracked;
    const items = parseItems(order.items);

    return (
      <OrderCard key={order.id || order.order_number}>
        <OrderHeader onClick={() => !isTracked && setExpandedId(isOpen ? null : order.id)}>
          <OrderLeft>
            <OrderNum>📦 {order.order_number}</OrderNum>
            <OrderDate>
              {formatDate(order.created_at)} · {items.length} item{items.length !== 1 ? "s" : ""}
            </OrderDate>
          </OrderLeft>
          <OrderRight>
            <StatusBadge $color={cfg.color} $bg={cfg.bg}>
              <StatusIcon size={12} /> {cfg.label}
            </StatusBadge>
            <OrderTotal>KES {parseFloat(order.total_amount || 0).toLocaleString("en-KE")}</OrderTotal>
            {!isTracked && (isOpen
              ? <ChevronUp size={16} color="#999" />
              : <ChevronDown size={16} color="#999" />
            )}
          </OrderRight>
        </OrderHeader>

        {isOpen && (
          <OrderBody>
            <Divider />
            <ItemsList>
              {items.map((item, i) => {
                const imgSrc = item.image || item.img
                  ? (item.image || item.img).startsWith('http') ? (item.image || item.img) : `${API.IMAGES}${item.image || item.img}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || "P")}&background=1e3c72&color=fff`;
                const productSlug = item.slug || null;
                const productLink = productSlug ? `/product/${productSlug}` : null;

                return (
                  <Item key={i}>
                    <ItemImg
                      src={imgSrc}
                      alt={item.name}
                      loading="lazy"
                      onError={e => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || "P")}&background=1e3c72&color=fff`;
                      }}
                    />
                    <ItemInfo>
                      <ItemName>{item.name}</ItemName>
                      <ItemMeta>Qty: {item.quantity}{item.size ? ` · Size: ${item.size}` : ""}</ItemMeta>
                      {/* SEO-friendly slug link back to product */}
                      {productLink && (
                        <SlugLink to={productLink}>
                          <ExternalLink size={10} /> View product
                        </SlugLink>
                      )}
                    </ItemInfo>
                    <ItemPrice>
                      KES {(parseFloat(item.price || 0) * (item.quantity || 1)).toLocaleString("en-KE")}
                    </ItemPrice>
                  </Item>
                );
              })}
            </ItemsList>

            <OrderMeta>
              <MetaItem>
                <div className="label">Delivery To</div>
                <div className="value">{order.address || "—"}</div>
              </MetaItem>
              <MetaItem>
                <div className="label">Payment</div>
                <div className="value">{order.payment_method || "M-Pesa"}</div>
              </MetaItem>
              <MetaItem>
                <div className="label">Ordered</div>
                <div className="value">{formatDate(order.created_at)}</div>
              </MetaItem>
            </OrderMeta>
          </OrderBody>
        )}
      </OrderCard>
    );
  };

  const userId = getStoredUserId();
  const username = (() => {
    try {
      const ud = localStorage.getItem("user_data");
      return ud ? JSON.parse(ud).username || JSON.parse(ud).real_name || "Your" : "Your";
    } catch { return "Your"; }
  })();

  return (
    <Wrapper>
      <Helmet>
        <title>My Order History — {username} | Siasahub Store</title>
        <meta name="description" content="View and track all your Siasahub Campaign Store purchases. Browse your order history, check delivery status, and access product pages." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://siasahub.co.ke/account/history" />
      </Helmet>

      <Header>
        <BackBtn to="/marketplace"><ArrowLeft size={14} /> Back to Shop</BackBtn>
      </Header>

      <PageTitle>My Order History</PageTitle>
      <PageSub>Track and manage all your campaign store purchases</PageSub>

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

      <ToolBar>
        <OrderCount>
          {loading ? "Loading..." : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}
        </OrderCount>
        <RefreshBtn onClick={() => fetchOrders(true)} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? "spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </RefreshBtn>
      </ToolBar>

      {loading ? (
        <EmptyState>
          <RefreshCw size={32} style={{ animation: `${spin} 1s linear infinite`, marginBottom: 12, display: "block", margin: "0 auto 12px" }} />
          <p>Loading your orders...</p>
        </EmptyState>
      ) : orders.length === 0 ? (
        <EmptyState>
          <ShoppingBag size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
          <p style={{ fontWeight: 600, marginBottom: 8 }}>No orders yet</p>
          <p style={{ fontSize: 13, marginBottom: 20 }}>
            {userId ? "When you place orders, they'll appear here." : "Login to see your full order history."}
          </p>
          <BrowseBtn onClick={() => navigate("/marketplace")}>
            <ShoppingBag size={14} /> Browse Products
          </BrowseBtn>
        </EmptyState>
      ) : (
        orders.map(order => renderOrderCard(order))
      )}
    </Wrapper>
  );
};

export default MyOrders;
