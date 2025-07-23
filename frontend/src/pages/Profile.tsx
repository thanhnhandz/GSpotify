import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { FaUser, FaMusic, FaHeart, FaList, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const Container = styled.div`
  padding: var(--space-xl);
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.6s ease-out;
`;

const ProfileHeader = styled.div`
  background: var(--accent-gradient);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  color: var(--text-white);
  margin-bottom: var(--space-xl);
  display: flex;
  align-items: center;
  gap: var(--space-xl);
  box-shadow: var(--shadow-accent);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -20%;
    right: -20%;
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%);
    border-radius: 50%;
    animation: profileFloat 8s ease-in-out infinite;
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 60%);
    border-radius: 50%;
    animation: profileFloat 6s ease-in-out infinite reverse;
    pointer-events: none;
  }
  
  @keyframes profileFloat {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-20px) scale(1.1); }
  }
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  border: 2px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: var(--text-white);
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 2;
  transition: all var(--transition-normal);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-xl);
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  position: relative;
  z-index: 2;
`;

const ProfileName = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--space-sm);
  color: var(--text-white);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
`;

const ProfileDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ProfileDetail = styled.p`
  font-size: 1rem;
  opacity: 0.9;
  color: var(--text-white);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 2;
`;

const UserRole = styled.span`
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
  display: inline-block;
  color: var(--text-white);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
`;

const EditButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  color: var(--text-white);
  border: 2px solid var(--glass-border);
  border-radius: var(--radius-full);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  position: relative;
  z-index: 2;

  &:hover {
    background: var(--glass-bg-strong);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
`;

const StatCard = styled.div`
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  text-align: center;
  border: 1px solid var(--border-light);
  transition: all var(--transition-normal);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    background: var(--bg-card-hover);
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--accent-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-md);
  font-size: 1.2rem;
  box-shadow: var(--shadow-sm);
`;

const StatValue = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
`;

const StatLabel = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

const EditForm = styled.div`
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  margin-bottom: var(--space-xl);
  animation: slideInLeft 0.5s ease-out;
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-lg);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid var(--border-medium);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background: var(--bg-card);
  color: var(--text-primary);
  transition: all var(--transition-fast);

  &:focus {
    outline: none;
    border-color: var(--text-accent);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    background: var(--bg-secondary);
    color: var(--text-tertiary);
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-md);
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: var(--primary-gradient);
          color: var(--text-white);
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-primary);
          }
        `;
      case 'danger':
        return `
          background: var(--danger-gradient);
          color: var(--text-white);
          
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
          }
        `;
      default:
        return `
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 2px solid var(--border-medium);
          
          &:hover {
            background: var(--bg-tertiary);
          }
        `;
    }
  }}
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.1rem;
  padding: var(--space-xl);
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #dc3545;
  font-size: 1.1rem;
  padding: var(--space-xl);
  background: #ffeaea;
  border: 1px solid #ffcdd2;
  border-radius: var(--radius-sm);
  margin: var(--space-md) 0;
`;

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [userStats, setUserStats] = useState({
    totalPlaylists: 0,
    totalLikedSongs: 0,
    totalUploads: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: ''
  });

  const loadUserStats = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load user statistics
      const [playlistsResponse, likedSongsResponse] = await Promise.all([
        api.get('/playlists'),
        api.get('/users/me/liked-songs')
      ]);
      
      let uploadsResponse = null;
      if (user?.role === 'artist') {
        uploadsResponse = await api.get(`/songs/?artist_id=${user.id}`);
      }
      
      setUserStats({
        totalPlaylists: playlistsResponse.data.length,
        totalLikedSongs: likedSongsResponse.data.length,
        totalUploads: uploadsResponse ? uploadsResponse.data.length : 0
      });
    } catch (err: any) {
      console.error('Error loading user stats:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load user statistics';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        full_name: user.full_name || ''
      });
      loadUserStats();
    }
  }, [user, loadUserStats]);



  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await api.put('/users/me', {
        username: formData.username,
        email: formData.email,
        full_name: formData.full_name
      });
      
      updateUser(response.data);
      setEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      alert(err.response?.data?.detail || 'Failed to update profile');
    }

  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        full_name: user.full_name || ''
      });
    }
    setEditing(false);
  };

  if (!user) {
    return (
      <Container>
        <ErrorMessage>Please log in to view your profile</ErrorMessage>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading your profile...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <ProfileHeader>
        <Avatar>
          <FaUser />
        </Avatar>
        <ProfileInfo>
          <ProfileName>{user.full_name || user.username}</ProfileName>
          <ProfileDetails>
            <ProfileDetail>@{user.username}</ProfileDetail>
            <ProfileDetail>{user.email}</ProfileDetail>
            <ProfileDetail>Member since {new Date(user.created_at).toLocaleDateString()}</ProfileDetail>
          </ProfileDetails>
          <UserRole>{user.role}</UserRole>
        </ProfileInfo>
        <EditButton onClick={() => setEditing(!editing)}>
          <FaEdit />
          {editing ? 'Cancel Edit' : 'Edit Profile'}
        </EditButton>
      </ProfileHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <StatsSection>
        <StatCard>
          <StatIcon>
            <FaList />
          </StatIcon>
          <StatValue>{userStats.totalPlaylists}</StatValue>
          <StatLabel>Playlists Created</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon>
            <FaHeart />
          </StatIcon>
          <StatValue>{userStats.totalLikedSongs}</StatValue>
          <StatLabel>Songs Liked</StatLabel>
        </StatCard>
        
        {user.role === 'artist' && (
          <StatCard>
            <StatIcon>
              <FaMusic />
            </StatIcon>
            <StatValue>{userStats.totalUploads}</StatValue>
            <StatLabel>Songs Uploaded</StatLabel>
          </StatCard>
        )}
      </StatsSection>

      {editing && (
        <EditForm>
          <FormTitle>Edit Profile</FormTitle>
          <Form onSubmit={handleSaveProfile}>
            <FormGroup>
              <Label>Username</Label>
              <Input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Full Name</Label>
              <Input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="Enter your full name"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Role</Label>
              <Input
                type="text"
                value={user.role}
                disabled
              />
            </FormGroup>
            
            <ButtonGroup>
              <Button type="button" onClick={handleCancelEdit}>
                <FaTimes />
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                <FaSave />
                Save Changes
              </Button>
            </ButtonGroup>
          </Form>
        </EditForm>
      )}
    </Container>
  );
}; 