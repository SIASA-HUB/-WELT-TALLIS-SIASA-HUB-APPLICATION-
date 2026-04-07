import React, { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Zap,
  ChevronRight,
  MapPin,
  Phone,
  MessageSquare,
  Target,
} from "lucide-react";

// --- THE COMMANDER THEME ---
const Layout = styled.div`
  background: #000;
  color: #fff;
  min-height: 100vh;
  padding: 30px 20px;
  font-family: "Inter", system-ui, sans-serif;
`;

const Header = styled.div`
  max-width: 800px;
  margin: 0 auto 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ListContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Row = styled(motion.div)`
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px 24px;
  display: grid;
  grid-template-columns: 48px 1.5fr 1fr 120px;
  align-items: center;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: rgba(187, 0, 0, 0.5);
    background: #0f0f0f;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${(props) =>
    props.premium ? "linear-gradient(45deg, #bb0000, #330000)" : "#1a1a1a"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
  }
  span {
    color: #666;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const Metric = styled.div`
  text-align: right;
  padding-right: 20px;
  .val {
    font-size: 16px;
    font-weight: 800;
    color: #fff;
  }
  .lab {
    font-size: 10px;
    color: #bb0000;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
  }
`;

const ActionBtn = styled(motion.button)`
  background: ${(props) =>
    props.secondary ? "rgba(255,255,255,0.05)" : "#fff"};
  color: ${(props) => (props.secondary ? "#fff" : "#000")};
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
`;

const ContactActions = styled(motion.div)`
  display: flex;
  gap: 8px;
  grid-column: span 4;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

// --- DUMMY DATA ---
const assets = [
  {
    id: 1,
    name: "P. Mumo",
    ward: "Nairobi West",
    reach: "18.4K",
    initial: "PM",
    premium: true,
  },
  {
    id: 2,
    name: "Amina G.",
    ward: "Nyali",
    reach: "9.2K",
    initial: "AG",
    premium: false,
  },
  {
    id: 3,
    name: "S. Otieno",
    ward: "Kisumu Central",
    reach: "11.0K",
    initial: "SO",
    premium: false,
  },
  {
    id: 4,
    name: "E. Mutuku",
    ward: "Mavoko",
    reach: "7.5K",
    initial: "EM",
    premium: true,
  },
];

const TopMobilizers = () => {
  const [hired, setHired] = useState([]);

  const toggleHire = (id) => {
    if (hired.includes(id)) return;
    setHired([...hired, id]);
  };

  return (
    <Layout>
      <Header>
        <div>
          <h1 style={{ fontSize: "20px", margin: 0, fontWeight: 900 }}>
            FIELD ASSETS
          </h1>
          <p style={{ color: "#444", fontSize: "12px" }}>
            DEPLOYMENT READY / 2027 CYCLE
          </p>
        </div>
        <div style={{ color: "#bb0000", fontSize: "12px", fontWeight: 700 }}>
          LIVE STATS •
        </div>
      </Header>

      <ListContainer>
        {assets.map((item) => (
          <Row
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: item.id * 0.05 }}
            layout
          >
            <Avatar premium={item.premium}>{item.initial}</Avatar>

            <Info>
              <h3>
                {item.name}{" "}
                {item.premium && (
                  <Shield
                    size={12}
                    fill="#bb0000"
                    color="#bb0000"
                    style={{ marginLeft: 4 }}
                  />
                )}
              </h3>
              <span>
                <MapPin size={10} /> {item.ward}
              </span>
            </Info>

            <Metric>
              <div className="val">{item.reach}</div>
              <div className="lab">Influence</div>
            </Metric>

            <div>
              {!hired.includes(item.id) ? (
                <ActionBtn
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleHire(item.id)}
                >
                  HIRE <Zap size={12} fill="black" />
                </ActionBtn>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "#44ff44",
                    fontSize: "10px",
                    fontWeight: 900,
                  }}
                >
                  CONNECTED
                </div>
              )}
            </div>

            <AnimatePresence>
              {hired.includes(item.id) && (
                <ContactActions
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                >
                  <ActionBtn secondary style={{ background: "#25D366" }}>
                    <MessageSquare size={14} /> WhatsApp
                  </ActionBtn>
                  <ActionBtn secondary>
                    <Phone size={14} /> Direct Call
                  </ActionBtn>
                  <ActionBtn secondary>
                    <Target size={14} /> View Map
                  </ActionBtn>
                </ContactActions>
              )}
            </AnimatePresence>
          </Row>
        ))}
      </ListContainer>
    </Layout>
  );
};

export default TopMobilizers;
