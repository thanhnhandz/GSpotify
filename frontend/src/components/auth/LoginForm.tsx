import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { LoginData } from '../../types';

const FormContainer = styled.div`
  max-width: 440px;
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
    background: var(--primary-gradient);
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
    background: var(--primary-gradient);
    border-radius: var(--radius-2xl) var(--radius-2xl) 4px 4px;
  }
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: var(--space-sm);
  color: var(--text-primary);
  font-weight: 800;
  font-size: 2.25rem;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.025em;
  position: relative;
  
  &::after {
    content: '👋';
    position: absolute;
    top: -0.5rem;
    right: -2rem;
    font-size: 1.5rem;
  }
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
  gap: var(--space-xl);
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
    box-shadow: 0 0 0 3px var(--border-accent), var(--shadow-md);
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
    border-color: var(--border-accent);
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

const Button = styled.button`
  background: var(--primary-gradient);
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
  box-shadow: var(--shadow-primary);
  
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
    box-shadow: var(--shadow-primary), var(--shadow-lg);
    background: var(--primary-gradient-hover);
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

const SignupLink = styled.div`
  text-align: center;
  margin-top: var(--space-xl);
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 500;

  a {
    color: transparent;
    background: var(--primary-gradient);
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
      background: var(--primary-gradient);
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

export const LoginForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const onSubmit = async (data: LoginData) => {
    try {
      await login(data.username, data.password);
      toast.success('Welcome back! 🎵');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Login failed';
      toast.error(errorMessage);
    }
  };

  return (
    <FormContainer>
      <Title>Welcome Back</Title>
      <Subtitle>Sign in to continue your musical journey</Subtitle>
      
      <Form onSubmit={handleSubmit(onSubmit)}>
        <InputGroup>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="Enter your username"
            className={errors.username ? 'error' : ''}
            {...register('username', { 
              required: 'Username is required',
              minLength: { value: 3, message: 'Username must be at least 3 characters' }
            })}
          />
          {errors.username && (
            <ErrorMessage>
              ⚠️ {errors.username.message}
            </ErrorMessage>
          )}
        </InputGroup>

        <InputGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            className={errors.password ? 'error' : ''}
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
          />
          {errors.password && (
            <ErrorMessage>
              ⚠️ {errors.password.message}
            </ErrorMessage>
          )}
        </InputGroup>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <LoadingSpinner />}
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </Form>

      <SignupLink>
        Don't have an account? <Link to="/signup">Create one here</Link>
      </SignupLink>
    </FormContainer>
  );
}; 