import React from 'react';
import styled from 'styled-components';
import { 
  Bell, History, Award, Download, HelpCircle, Settings, LogOut, Save 
} from 'lucide-react';

const SettingsListContainer = styled.div`
  background: white;
  margin: 0 15px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  border: 1px solid #f1f5f9;
  animation: fadeIn 1.4s ease-out;
`;

const SettingsList = ({ onLogout, onSaveProfile }) => {
  const settingsOptions = [
    { icon: Bell, label: 'Notifications', color: '#BB0000' },
    { icon: History, label: 'Activity History', color: '#10b981' },
    { icon: Award, label: 'Earned Badges', color: '#f59e0b' },
    { icon: Download, label: 'Export Data', color: '#3b82f6' },
    { icon: HelpCircle, label: 'Help & Support', color: '#8b5cf6' },
    { icon: Settings, label: 'Account Settings', color: '#64748b' },
    { icon: Save, label: 'Save Profile', color: '#10b981' },
    { icon: LogOut, label: 'Logout', color: '#ef4444', isLast: true }
  ];

  const descriptions = {
    'Notifications': 'Manage your alerts',
    'Activity History': 'View your activity log',
    'Earned Badges': 'See all your achievements',
    'Export Data': 'Download your information',
    'Help & Support': 'Get help and contact support',
    'Account Settings': 'Manage account preferences',
    'Save Profile': 'Save your profile changes',
    'Logout': 'Sign out of your account'
  };

  const handleClick = (label) => {
    switch(label) {
      case 'Logout':
        onLogout();
        break;
      case 'Save Profile':
        onSaveProfile();
        break;
      case 'Notifications':
        alert('Notifications settings would open here');
        break;
      case 'Activity History':
        alert('Activity history would open here');
        break;
      case 'Earned Badges':
        alert('Earned badges would open here');
        break;
      case 'Export Data':
        alert('Export data functionality would be here');
        break;
      case 'Help & Support':
        alert('Help and support would open here');
        break;
      case 'Account Settings':
        alert('Account settings would open here');
        break;
      default:
        break;
    }
  };

  return (
    <SettingsListContainer>
      {settingsOptions.map((item) => (
        <div
          key={item.label}
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 15,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            borderBottom: item.isLast ? 'none' : '1px solid #f1f5f9',
            backgroundColor: '#fff',
            ':hover': {
              backgroundColor: '#f8fafc'
            }
          }}
          onClick={() => handleClick(item.label)}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${item.color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center' // Fixed typo here
          }}>
            <item.icon size={18} color={item.color} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '15px', 
              fontWeight: 600,
              color: '#1e293b'
            }}>
              {item.label}
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: '#94a3b8',
              marginTop: 2
            }}>
              {descriptions[item.label]}
            </div>
          </div>
          <div style={{ color: '#cbd5e1' }}>
            →
          </div>
        </div>
      ))}
    </SettingsListContainer>
  );
};

export default SettingsList;