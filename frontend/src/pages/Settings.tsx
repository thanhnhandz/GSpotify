import React, { useState } from 'react';
import styled from 'styled-components';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { FaCog, FaLock, FaBell, FaUser, FaTrash, FaSave } from 'react-icons/fa';

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SettingsSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a1a1a;
`;

const SectionContent = styled.div`
  padding: 1.5rem;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

const SettingDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #1db954;
  }

  &:checked + span:before {
    transform: translateX(22px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 28px;

  &:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #1db954;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${props => props.variant === 'danger' ? `
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
    }
  ` : `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
    }
  `}
`;

const DangerZone = styled.div`
  background: #fff5f5;
  border: 2px solid #fed7d7;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
`;

const DangerTitle = styled.h3`
  color: #e53e3e;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const DangerDescription = styled.p`
  color: #e53e3e;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

export const Settings: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    playlistUpdates: true,
    newFollowers: false,
    marketingEmails: false
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleToggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveNotifications = async () => {
    try {
      await api.put('/users/notification-settings', {
        email_notifications: settings.emailNotifications,
        playlist_updates: settings.playlistUpdates,
        new_followers: settings.newFollowers
      });
      alert('Notification settings saved successfully!');
    } catch (err: any) {
      console.error('Error saving notification settings:', err);
      alert(err.response?.data?.detail || 'Failed to save notification settings');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      await api.post('/auth/change-password', {
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      alert('Password changed successfully!');
    } catch (err: any) {
      console.error('Error changing password:', err);
      alert(err.response?.data?.detail || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'Are you sure you want to delete your account? This action cannot be undone. Type "DELETE" to confirm:'
    );
    
    if (confirmation !== 'DELETE') {
      return;
    }

    try {
      await api.delete('/users/me');
      logout();
      alert('Account deleted successfully');
    } catch (err: any) {
      console.error('Error deleting account:', err);
      alert(err.response?.data?.detail || 'Failed to delete account');
    }
  };

  return (
    <Container>
      <Title>
        <FaCog />
        Settings
      </Title>

      {/* Notifications Settings */}
      <SettingsSection>
        <SectionHeader>
          <FaBell />
          <SectionTitle>Notifications</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <SettingItem>
            <SettingInfo>
              <SettingLabel>Email Notifications</SettingLabel>
              <SettingDescription>Receive important updates via email</SettingDescription>
            </SettingInfo>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleToggleSetting('emailNotifications')}
              />
              <ToggleSlider />
            </ToggleSwitch>
          </SettingItem>

          <SettingItem>
            <SettingInfo>
              <SettingLabel>Playlist Updates</SettingLabel>
              <SettingDescription>Get notified when playlists you follow are updated</SettingDescription>
            </SettingInfo>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={settings.playlistUpdates}
                onChange={() => handleToggleSetting('playlistUpdates')}
              />
              <ToggleSlider />
            </ToggleSwitch>
          </SettingItem>

          <SettingItem>
            <SettingInfo>
              <SettingLabel>New Followers</SettingLabel>
              <SettingDescription>Be notified when someone follows your playlists</SettingDescription>
            </SettingInfo>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={settings.newFollowers}
                onChange={() => handleToggleSetting('newFollowers')}
              />
              <ToggleSlider />
            </ToggleSwitch>
          </SettingItem>

          <SettingItem>
            <SettingInfo>
              <SettingLabel>Marketing Emails</SettingLabel>
              <SettingDescription>Receive updates about new features and promotions</SettingDescription>
            </SettingInfo>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={settings.marketingEmails}
                onChange={() => handleToggleSetting('marketingEmails')}
              />
              <ToggleSlider />
            </ToggleSwitch>
          </SettingItem>

          <Button onClick={handleSaveNotifications} style={{ marginTop: '1rem', alignSelf: 'flex-start' }}>
            <FaSave />
            Save Notification Settings
          </Button>
        </SectionContent>
      </SettingsSection>

      {/* Security Settings */}
      <SettingsSection>
        <SectionHeader>
          <FaLock />
          <SectionTitle>Security</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <Form onSubmit={handleChangePassword}>
            <FormGroup>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                required
                minLength={6}
              />
            </FormGroup>

            <FormGroup>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                required
                minLength={6}
              />
            </FormGroup>

            <Button type="submit" style={{ alignSelf: 'flex-start' }}>
              <FaLock />
              Change Password
            </Button>
          </Form>
        </SectionContent>
      </SettingsSection>

      {/* Account Information */}
      <SettingsSection>
        <SectionHeader>
          <FaUser />
          <SectionTitle>Account Information</SectionTitle>
        </SectionHeader>
        <SectionContent>
          <SettingItem>
            <SettingInfo>
              <SettingLabel>Username</SettingLabel>
              <SettingDescription>{user?.username}</SettingDescription>
            </SettingInfo>
          </SettingItem>

          <SettingItem>
            <SettingInfo>
              <SettingLabel>Email</SettingLabel>
              <SettingDescription>{user?.email}</SettingDescription>
            </SettingInfo>
          </SettingItem>

          <SettingItem>
            <SettingInfo>
              <SettingLabel>Account Type</SettingLabel>
              <SettingDescription style={{ textTransform: 'capitalize' }}>{user?.role}</SettingDescription>
            </SettingInfo>
          </SettingItem>

          <SettingItem>
            <SettingInfo>
              <SettingLabel>Member Since</SettingLabel>
              <SettingDescription>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </SettingDescription>
            </SettingInfo>
          </SettingItem>
        </SectionContent>
      </SettingsSection>

      {/* Danger Zone */}
      <DangerZone>
        <DangerTitle>Danger Zone</DangerTitle>
        <DangerDescription>
          Once you delete your account, there is no going back. Please be certain.
          All your playlists, liked songs, and uploaded content will be permanently removed.
        </DangerDescription>
        <Button variant="danger" onClick={handleDeleteAccount}>
          <FaTrash />
          Delete Account
        </Button>
      </DangerZone>
    </Container>
  );
}; 