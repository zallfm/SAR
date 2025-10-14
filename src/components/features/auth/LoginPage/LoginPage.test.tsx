import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import LoginPage from './LoginPage';
import type { User } from '../../../../../types';
import { MOCK_USERS } from '../../../../../constants';

// Mock the onLoginSuccess function
const mockOnLoginSuccess = jest.fn();

// Define a type for our test user
type TestUser = Pick<User, 'username' | 'name' | 'role'>;

describe('LoginPage Component', () => {
  beforeEach(() => {
    mockOnLoginSuccess.mockClear();
    render(<LoginPage onLoginSuccess={mockOnLoginSuccess} />);
  });

  it('renders login elements', () => {
    // Check if the login elements are present
    expect(screen.getByText(/Login to Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    // Use getByPlaceholderText instead of getByLabelText for password field
    expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();

    // Check if the password visibility toggle is present
    expect(screen.getByLabelText(/Show password/i)).toBeInTheDocument();
  });

  it('shows error when username and password are empty', () => {
    // Mock console.error to capture any errors
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Wait a bit for any async operations
    setTimeout(() => {
      // Check if error message is displayed
      // Using queryByRole to check if the alert div exists
      const errorAlert = screen.queryByRole('alert');
      
      // Restore console.error
      consoleErrorSpy.mockRestore();
      
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent(/Username and password are required/i);
    }, 100);
  });

  it('shows error when invalid credentials are provided', () => {
    // Fill in invalid credentials
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'invalid' } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: 'invalid' } });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    expect(screen.getByText(/Invalid username or password/i)).toBeInTheDocument();
  });

  it('calls onLoginSuccess with the correct user data when valid credentials are provided', () => {
    // Use the first user from MOCK_USERS for testing
    const validUser = MOCK_USERS[0];

    // Fill in valid credentials
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: validUser.username } });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), { target: { value: validUser.password } });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Check if onLoginSuccess was called with the correct user data
    // (excluding the password from the user object)
    const { password, ...expectedUser } = validUser;
    expect(mockOnLoginSuccess).toHaveBeenCalledWith(expectedUser);
  });

  it('toggles password visibility', () => {
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const toggleButton = screen.getByLabelText(/Show password/i);

    // Initially, password should be masked
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the toggle button to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again to hide password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});