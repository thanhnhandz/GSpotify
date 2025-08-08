import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '../../services/api';
import { User } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { FaUsers, FaUserShield, FaEye, FaShieldAlt } from 'react-icons/fa';

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: var(--secondary-gradient);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  color: var(--text-white);
  margin-bottom: var(--space-xl);
  box-shadow: var(--shadow-secondary);
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 20%;
    right: -10%;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    animation: pulse 4s ease-in-out infinite;
    pointer-events: none;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.15; }
    50% { transform: scale(1.2); opacity: 0.25; }
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--space-md);
  color: var(--text-white);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 2;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  color: var(--text-white);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 2;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.2rem;
`;

const StatValue = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.p`
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`;

const ToolsBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 300px;
  flex: 1;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;



const Table = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  background: #f8f9fa;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 150px;
  gap: 1rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const TableRow = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 150px;
  gap: 1rem;
  align-items: center;
  transition: background 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div``;

const UserName = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

const UserEmail = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'admin':
        return 'background: #f8d7da; color: #721c24;';
      case 'artist':
        return 'background: #d1ecf1; color: #0c5460;';
      case 'user':
        return 'background: #d4edda; color: #155724;';
      case 'active':
        return 'background: #d4edda; color: #155724;';
      case 'inactive':
        return 'background: #f8d7da; color: #721c24;';
      default:
        return 'background: #e9ecef; color: #6c757d;';
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ variant?: 'view' | 'toggle' | 'promote' }>`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => {
    switch (props.variant) {
      case 'view':
        return 'background: #007bff; &:hover { transform: scale(1.1); background: #0056b3; }';
      case 'toggle':
        return 'background: #6c757d; &:hover { transform: scale(1.1); background: #545b62; }';
      case 'promote':
        return 'background: #28a745; &:hover { transform: scale(1.1); background: #218838; }';
      default:
        return 'background: #007bff; &:hover { transform: scale(1.1); }';
    }
  }}
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  padding: 3rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #e74c3c;
  font-size: 1.1rem;
  padding: 2rem;
  background: #ffeaea;
  border-radius: 8px;
  margin: 1rem 0;
`;

const RoleSelect = styled.select`
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  font-size: 0.9rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
`;

const PaginationInfo = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PaginationButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: ${props => props.active ? '#3498db' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background: ${props => props.active ? '#2980b9' : '#f8f9fa'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ManageUsers: React.FC = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Calculate stats
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.is_active).length,
    totalArtists: users.filter(u => u.role === 'artist').length,
    totalAdmins: users.filter(u => u.role === 'admin').length,
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(u => 
        filterStatus === 'active' ? u.is_active : !u.is_active
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleChangeUserRole = async (userId: number, newRole: string) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    if (newRole !== 'user' && newRole !== 'artist' && newRole !== 'admin') {
      alert('Invalid role selected');
      return;
    }

    const typedRole = newRole as 'user' | 'artist' | 'admin';

    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: typedRole } : u
      ));
    } catch (err: any) {
      console.error('Error changing user role:', err);
      alert(err.response?.data?.detail || 'Failed to change user role');
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_active: !currentStatus } : u
      ));
    } catch (err: any) {
      console.error('Error toggling user status:', err);
      alert(err.response?.data?.detail || 'Failed to update user status');
    }
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (!user || user.role !== 'admin') {
    return (
      <Container>
        <ErrorMessage>Access denied. Administrator privileges required.</ErrorMessage>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <LoadingMessage>Loading users...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Manage Users</Title>
        <Subtitle>View, edit, and manage all platform users</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon color="var(--accent-gradient)">
            <FaUsers />
          </StatIcon>
          <StatValue>{stats.totalUsers}</StatValue>
          <StatLabel>Total Users</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--success-gradient)">
            <FaUserShield />
          </StatIcon>
          <StatValue>{stats.activeUsers}</StatValue>
          <StatLabel>Active Users</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--warning-gradient)">
            <FaUserShield />
          </StatIcon>
          <StatValue>{stats.totalArtists}</StatValue>
          <StatLabel>Artists</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--danger-gradient)">
            <FaShieldAlt />
          </StatIcon>
          <StatValue>{stats.totalAdmins}</StatValue>
          <StatLabel>Admins</StatLabel>
        </StatCard>
      </StatsGrid>

      <ToolsBar>
        <SearchInput
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <FilterSelect value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="artist">Artists</option>
          <option value="admin">Admins</option>
        </FilterSelect>
        
        <FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </FilterSelect>
      </ToolsBar>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {currentUsers.length === 0 ? (
        <EmptyState>
          <FaUsers size={48} style={{ color: '#ddd', marginBottom: '1rem' }} />
          <h3>No users found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </EmptyState>
      ) : (
        <Table>
          <TableHeader>
            <div>User</div>
            <div>Role</div>
            <div>Status</div>
            <div>Joined</div>
            <div>Last Active</div>
            <div>Actions</div>
          </TableHeader>
          
          {currentUsers.map(userItem => (
            <TableRow key={userItem.id}>
              <UserInfo>
                <UserName>{userItem.username}</UserName>
                <UserEmail>{userItem.email}</UserEmail>
              </UserInfo>
              
              <div>
                <RoleSelect 
                  value={userItem.role} 
                  onChange={(e) => handleChangeUserRole(userItem.id, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="artist">Artist</option>
                  <option value="admin">Admin</option>
                </RoleSelect>
              </div>
              
              <div>
                <StatusBadge status={userItem.is_active ? 'active' : 'inactive'}>
                  {userItem.is_active ? 'Active' : 'Inactive'}
                </StatusBadge>
              </div>
              
              <div>{new Date(userItem.created_at).toLocaleDateString()}</div>
              
              <div>-</div>
              
              <ActionButtons>
                <ActionButton variant="view" title="View Details">
                  <FaEye size={14} />
                </ActionButton>
                <ActionButton 
                  variant="toggle"
                  onClick={() => handleToggleUserStatus(userItem.id, userItem.is_active)}
                  title={userItem.is_active ? 'Deactivate User' : 'Activate User'}
                >
                  <FaShieldAlt size={14} />
                </ActionButton>
              </ActionButtons>
            </TableRow>
          ))}
          
          {totalPages > 1 && (
            <Pagination>
              <PaginationInfo>
                Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
              </PaginationInfo>
              
              <PaginationButtons>
                <PaginationButton 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </PaginationButton>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <PaginationButton
                      key={pageNumber}
                      active={currentPage === pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationButton>
                  );
                })}
                
                <PaginationButton 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </PaginationButton>
              </PaginationButtons>
            </Pagination>
          )}
        </Table>
      )}
    </Container>
  );
}; 