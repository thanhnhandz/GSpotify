import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { SignupData } from '../../types';

const FormContainer = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: var(--space-3xl);
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur-strong);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-2xl);
  position: relative;
  z-index: 1;
  animation: fadeIn 0.6s ease-out;

  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    background: var(--secondary-gradient);
    border-radius: calc(var(--radius-2xl) + 3px);
    z-index: -1;
    opacity: 0.05;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--secondary-gradient);
    border-radius: var(--radius-2xl) var(--radius-2xl) 4px 4px;
  }
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: var(--space-sm);
  color: var(--text-primary);
  font-weight: 800;
  font-size: 2.25rem;
  background: var(--secondary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.025em;
`;

const Subtitle = styled.p`
  text-align: center;
  margin-bottom: var(--space-3xl);
  color: var(--text-secondary);
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  position: relative;
`;

const Label = styled.label`
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-bottom: var(--space-xs);
  transition: color var(--transition-normal);
  
  &:hover {
    color: var(--text-accent);
  }
`;

const Input = styled.input`
  padding: var(--space-md) var(--space-lg);
  border: 2px solid var(--border-medium);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-primary);
  transition: all var(--transition-normal);
  position: relative;
  
  &:focus {
    outline: none;
    border-color: transparent;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2), var(--shadow-md);
    transform: translateY(-2px);
  }

  &.error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    animation: shake 0.5s ease-in-out;
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  &::placeholder {
    color: var(--text-tertiary);
    font-weight: 400;
  }
  
  &:hover:not(:focus) {
    border-color: rgba(245, 158, 11, 0.3);
    background: rgba(255, 255, 255, 0.95);
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: var(--space-sm);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  animation: slideInLeft 0.3s ease-out;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  margin: var(--space-md) 0;
  padding: var(--space-lg);
  background: rgba(255, 255, 255, 0.7);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  transition: all var(--transition-normal);

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    border-color: var(--border-accent);
  }

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    margin: 0;
    accent-color: #f59e0b;
    cursor: pointer;
    border-radius: var(--radius-sm);
  }

  label {
    font-size: 0.95rem;
    margin: 0;
    line-height: 1.5;
    cursor: pointer;
    flex: 1;
    font-weight: 500;
    color: var(--text-primary);
  }
`;

const Button = styled.button`
  background: var(--secondary-gradient);
  color: white;
  border: none;
  padding: var(--space-lg) var(--space-xl);
  border-radius: var(--radius-md);
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-normal);
  margin-top: var(--space-md);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-secondary);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: var(--shadow-secondary), var(--shadow-lg);
    background: var(--secondary-gradient-hover);
  }

  &:hover::before {
    left: 100%;
  }

  &:active {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    background: var(--text-tertiary);
  }
`;

const LoginLink = styled.div`
  text-align: center;
  margin-top: var(--space-xl);
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 500;

  a {
    color: transparent;
    background: var(--secondary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-decoration: none;
    font-weight: 700;
    transition: all var(--transition-normal);
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--secondary-gradient);
      transition: width var(--transition-normal);
    }

    &:hover::after {
      width: 100%;
    }
  }
`;

const LoadingSpinner = styled.div`
  width: 22px;
  height: 22px;
  border: 3px solid transparent;
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: var(--space-sm);
`;

const RoleSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
`;

const RoleOption = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: rgba(255, 255, 255, 0.7);
  border-radius: var(--radius-md);
  border: 2px solid var(--border-light);
  cursor: pointer;
  transition: all var(--transition-normal);

  &:hover {
    background: rgba(255, 255, 255, 0.85);
    border-color: var(--border-accent);
    transform: translateY(-1px);
  }

  input[type="radio"] {
    width: 20px;
    height: 20px;
    margin: 2px 0 0 0;
    accent-color: #f59e0b;
    cursor: pointer;
  }

  input[type="radio"]:checked + label {
    color: var(--text-accent);
  }

  &:has(input[type="radio"]:checked) {
    border-color: var(--border-accent);
    background: rgba(245, 158, 11, 0.1);
  }
`;

const RoleLabel = styled.label`
  cursor: pointer;
  flex: 1;
  margin: 0;
`;

const RoleTitle = styled.div`
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
`;

const RoleDescription = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
`;

export const SignupForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<SignupData & { confirmPassword: string }>();
  const navigate = useNavigate();
  const { signup } = useAuthStore();

  const password = watch('password');

  const onSubmit = async (data: SignupData & { confirmPassword: string }) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const signupData: SignupData = {
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role || 'user',
        agreed_to_terms: data.agreed_to_terms || false
      };
      
      await signup(signupData);
      toast.success('Account created successfully!');
      navigate('/login');
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Signup failed';
      toast.error(errorMessage);
    }
  };

  return (
    <FormContainer>
      <Title>Join GSpotify</Title>
      <Subtitle>Create your account and start your musical adventure</Subtitle>
      
      <Form onSubmit={handleSubmit(onSubmit)}>
        <InputGroup>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="Choose a unique username"
            className={errors.username ? 'error' : ''}
            {...register('username', { 
              required: 'Username is required',
              minLength: { value: 3, message: 'Username must be at least 3 characters' },
              pattern: { 
                value: /^[a-zA-Z0-9_]+$/, 
                message: 'Username can only contain letters, numbers, and underscores' 
              }
            })}
          />
          {errors.username && (
            <ErrorMessage>
              Warning: {errors.username.message}
            </ErrorMessage>
          )}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            className={errors.email ? 'error' : ''}
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
              }
            })}
          />
          {errors.email && (
            <ErrorMessage>
              Warning: {errors.email.message}
            </ErrorMessage>
          )}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a strong password"
            className={errors.password ? 'error' : ''}
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
              }
            })}
          />
          {errors.password && (
            <ErrorMessage>
              Warning: {errors.password.message}
            </ErrorMessage>
          )}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            className={errors.confirmPassword ? 'error' : ''}
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match'
            })}
          />
          {errors.confirmPassword && (
            <ErrorMessage>
              Warning: {errors.confirmPassword.message}
            </ErrorMessage>
          )}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="role">Account Type</Label>
          <RoleSelector>
            <RoleOption>
              <input
                type="radio"
                id="role-user"
                value="user"
                {...register('role', { required: 'Please select an account type' })}
              />
              <RoleLabel htmlFor="role-user">
                <RoleTitle>Music Listener</RoleTitle>
                <RoleDescription>Browse, stream, and create playlists</RoleDescription>
              </RoleLabel>
            </RoleOption>
            <RoleOption>
              <input
                type="radio"
                id="role-artist"
                value="artist"
                {...register('role', { required: 'Please select an account type' })}
              />
              <RoleLabel htmlFor="role-artist">
                <RoleTitle>Music Artist</RoleTitle>
                <RoleDescription>Upload songs, create albums, view analytics</RoleDescription>
              </RoleLabel>
            </RoleOption>
          </RoleSelector>
          {errors.role && (
            <ErrorMessage>
              Warning: {errors.role.message}
            </ErrorMessage>
          )}
        </InputGroup>

        <CheckboxGroup>
          <input
            type="checkbox"
            id="agreed_to_terms"
            {...register('agreed_to_terms', { required: 'You must agree to the terms' })}
          />
          <Label htmlFor="agreed_to_terms">
            I agree to the Terms of Service and Privacy Policy
          </Label>
        </CheckboxGroup>
        {errors.agreed_to_terms && (
          <ErrorMessage>
            Warning: {errors.agreed_to_terms.message}
          </ErrorMessage>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <LoadingSpinner />}
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>
      </Form>

      <LoginLink>
        Already have an account? <Link to="/login">Sign in here</Link>
      </LoginLink>
    </FormContainer>
  );
}; 