import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Home, UserCheck, Users, User, DollarSign } from 'lucide-react';

const KENYA_THEME = {
  primary: '#BB0000',
  accent: '#006600',
  border: '#E2E8F0',
  text: { secondary: '#64748B' },
  partyColors: { 'ODM': '#006600' }
};

const NavContainer = styled.nav`
  position: fixed; 
  bottom: 0; 
  left: 0;
  right: 0;
  background: white;
  display: flex; 
  justify-content: space-around;
  padding: 8px 0;
  border-top: 1px solid ${KENYA_THEME.border};
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  /* Safe area for iPhones with notches */
  padding-bottom: env(safe-area-inset-bottom, 8px);
`;

const NavItem = styled(Link)`
  display: flex; 
  flex-direction: column; 
  align-items: center;
  text-decoration: none;
  color: ${props => props.$active ? KENYA_THEME.primary : KENYA_THEME.text.secondary};
  cursor: pointer;
  padding: 4px;
  min-width: 64px;
  transition: all 0.2s ease;
  
  span { 
    font-size: 9px; 
    font-weight: 600; 
    margin-top: 4px; 
    text-transform: uppercase;
  }

  &:active {
    transform: scale(0.9);
  }
`;

const NavMenu = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home, color: KENYA_THEME.primary },
    { path: '/leaders', label: 'Leaders', icon: UserCheck, color: KENYA_THEME.partyColors['ODM'] },
  

    { path: '/profile', label: 'Profile', icon: User, color: KENYA_THEME.accent }
  ];

  return (
    <NavContainer>
      {navItems.map((item) => (
        <NavItem 
          key={item.path} 
          to={item.path} 
          $active={location.pathname === item.path}
        >
          <item.icon 
            size={20} 
            color={location.pathname === item.path ? item.color : '#64748B'} 
          />
          <span>{item.label}</span>
        </NavItem>
      ))}
    </NavContainer>
  );
};

export default NavMenu;