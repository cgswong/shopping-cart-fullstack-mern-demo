import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

const mockNavigate = vi.fn();
const mockSetUser = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useOutletContext: () => ({ setUser: mockSetUser })
  };
});

function renderLogin() {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
}

describe('Login Component', () => {
  it('renders login form by default', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it('switches to register form', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    await user.click(screen.getByText('Register'));
    
    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });

  it('handles successful registration', async () => {
    const user = userEvent.setup();
    renderLogin();
    
    await user.click(screen.getByText('Register'));
    await user.type(screen.getByPlaceholderText(/name/i), 'Test User');
    await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/products');
    });
  });
});
