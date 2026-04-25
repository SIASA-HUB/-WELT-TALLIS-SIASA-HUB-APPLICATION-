import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  ShieldCheck,
  LogOut,
  AtSign,
  Award,
  MapPin,
  User as UserIcon,
  Mail,
  Calendar,
  Briefcase,
  Flag,
  Wallet as WalletIcon,
  TrendingUp,
  History,
  CreditCard,
  ChevronRight,
  ExternalLink,
  Star,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import walletApi from "./ApiConfig";
import WalletRecharge from "./Wallet";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmers = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Styled Components
const PageContainer = styled.div`
  background: #000000;
  min-height: 100vh;
  color: #fff;
  font-family: 'Inter', sans-serif;
  padding: 0 20px 100px;
  overflow-x: hidden;
`;

const ContentWrapper = styled.div`
  max-width: 500px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease-out;
`;

const TopNav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px 0 20px;
  
  .brand {
    font-size: 18px;
    font-weight: 800;
    color: #10b981;
    letter-spacing: -0.5px;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;
`;

const SmallAvatar = styled.div`
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  color: #000;
  box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
`;

const HeaderText = styled.div`
  .welcome {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 2px;
  }
  .display-name {
    font-size: 18px;
    font-weight: 800;
    color: #fff;
  }
`;

const MainWalletCard = styled.div`
  background: linear-gradient(145deg, #0a0a0a 0%, #050505 100%);
  border-radius: 32px;
  padding: 36px 30px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

  &::after {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 150px; height: 150px;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.08), transparent 70%);
    pointer-events: none;
  }
`;

const HugeBalance = styled.div`
  .lab {
    font-size: 11px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    svg { color: #10b981; }
  }
  .val {
    font-size: 52px;
    font-weight: 900;
    letter-spacing: -2px;
    color: #fff;
    display: flex;
    align-items: baseline;
    gap: 10px;
    span {
      font-size: 18px;
      color: rgba(255, 255, 255, 0.2);
      font-weight: 600;
      letter-spacing: 0;
    }
  }
`;

const MiniStats = styled.div`
  display: flex;
  gap: 30px;
  margin-top: 36px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
`;

const MiniStatItem = styled.div`
  .v {
    font-size: 16px;
    font-weight: 800;
    color: #10b981;
  }
  .l {
    font-size: 10px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
    margin-top: 4px;
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 40px;
`;

const ActionItem = styled.button`
  background: ${props => props.primary ? '#10b981' : 'rgba(255, 255, 255, 0.03)'};
  color: ${props => props.primary ? '#000' : '#fff'};
  border: 1px solid ${props => props.primary ? '#10b981' : 'rgba(255, 255, 255, 0.05)'};
  padding: 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.primary ? '#0d9668' : 'rgba(255, 255, 255, 0.06)'};
  }
`;

const UserDetailsCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border-radius: 28px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.03);
`;

const DetailGroup = styled.div`
  margin-bottom: 30px;
  &:last-child { margin-bottom: 0; }
  
  .head {
    font-size: 10px;
    font-weight: 800;
    color: #10b981;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: 16px;
  }
`;

// ========== MISSING STYLED COMPONENTS ==========
const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  .content {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }
  
  .value {
    font-size: 13px;
    font-weight: 500;
    color: #fff;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #0a0a0a;
  border-radius: 32px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const CloseModal = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 30px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.2s;
  z-index: 10;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
  }
`;

// ========== COMPONENT ==========
const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [stats, setStats] = useState({
    balance: 0,
    spent: 0,
    deposited: 0,
    txCount: 0
  });

  useEffect(() => {
    const initProfile = async () => {
      try {
        const storedUser = localStorage.getItem("user_data");
        const storedLeader = localStorage.getItem("leaderData");
        
        let user = null;
        if (storedUser) {
          user = JSON.parse(storedUser);
        } else if (storedLeader) {
          user = JSON.parse(storedLeader);
          // Normalize leader data for UI
          user.real_name = user.real_name || user.name;
          user.role = "aspirant";
          user.user_id = user.id || user.leader_id;
        }

        if (!user) {
          navigate("/login");
          return;
        }

        setUserData(user);

        const res = await walletApi.get(`/users/${user.user_id}/stats`);
        if (res.success) {
          setStats({
            balance: res.data.balance || 0,
            spent: res.data.total_spent || 0,
            deposited: res.data.total_deposited || 0,
            txCount: res.data.transaction_count || 0
          });
        }
      } catch (err) {
        console.error("Profile init error:", err);
      } finally {
        setLoading(false);
      }
    };

    initProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) return null;

  return (
    <PageContainer>
      <ContentWrapper>
        <TopNav>
          <div className="brand">SiasaHub</div>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
          >
            <LogOut size={20} />
          </button>
        </TopNav>

        <HeaderSection>
          <SmallAvatar>
            {userData?.real_name?.charAt(0) || "S"}
          </SmallAvatar>
          <HeaderText>
            <div className="welcome">
              {userData?.role === 'admin' ? 'Strategic Partner' : 
               userData?.role === 'aspirant' ? 'Leader Dashboard' : 'Citizen Dashboard'}
            </div>
            <div className="display-name">{userData?.real_name || userData?.username || userData?.name}</div>
          </HeaderText>
        </HeaderSection>

        <MainWalletCard>
          <HugeBalance>
            <div className="lab">
              <WalletIcon size={14} /> Available Siasa Points
            </div>
            <div className="val">
              {stats.balance.toLocaleString()}
              <span>pts</span>
            </div>
          </HugeBalance>

          <MiniStats>
            <MiniStatItem>
              <div className="v">{stats.deposited.toLocaleString()}</div>
              <div className="l">Deposited</div>
            </MiniStatItem>
            <MiniStatItem>
              <div className="v">{stats.spent.toLocaleString()}</div>
              <div className="l">Utilized</div>
            </MiniStatItem>
            <MiniStatItem>
              <div className="v">{stats.txCount}</div>
              <div className="l">Activities</div>
            </MiniStatItem>
          </MiniStats>
        </MainWalletCard>

        <QuickActions>
          <ActionItem primary onClick={() => setShowWalletModal(true)}>
            <CreditCard size={18} /> Recharge
          </ActionItem>
          <ActionItem onClick={() => navigate("/leaders")}>
            <TrendingUp size={18} /> Endorse
          </ActionItem>
        </QuickActions>

        <UserDetailsCard>
          <DetailGroup>
            <div className="head">Credentials & Region</div>
            <InfoRow>
              <div className="content"><AtSign size={14} /> Username</div>
              <div className="value">@{userData?.username}</div>
            </InfoRow>
            <InfoRow>
              <div className="content"><Mail size={14} /> Contact</div>
              <div className="value">{userData?.email || "N/A"}</div>
            </InfoRow>
            <InfoRow>
              <div className="content"><MapPin size={14} /> Region</div>
              <div className="value">{userData?.county || "Kenya"} {userData?.ward ? `• ${userData.ward}` : ""}</div>
            </InfoRow>
          </DetailGroup>

          <DetailGroup>
            <div className="head">Participation Data</div>
            <InfoRow>
              <div className="content"><Briefcase size={14} /> Employment</div>
              <div className="value">{userData?.employment_status || "Active"}</div>
            </InfoRow>
            <InfoRow>
              <div className="content"><Flag size={14} /> Party</div>
              <div className="value">{userData?.political_party || "Member"}</div>
            </InfoRow>
            <InfoRow>
              <div className="content"><ShieldCheck size={14} /> Status</div>
              <div className="value" style={{ color: '#10b981' }}>{userData?.voter_status || "Verified"}</div>
            </InfoRow>
          </DetailGroup>
        </UserDetailsCard>

      </ContentWrapper>

      {showWalletModal && (
        <ModalOverlay onClick={() => setShowWalletModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CloseModal onClick={() => setShowWalletModal(false)}>
              <X size={18} />
            </CloseModal>
            <div style={{ padding: '0px' }}>
              <WalletRecharge />
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default ProfilePage;