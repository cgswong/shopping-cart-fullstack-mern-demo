import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { mockLocalStorage } from './test/utils';

// Mock localStorage
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage() });

function renderApp() {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders navigation with Products link', () => {
    renderApp();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('shows Login link when user is not authenticated', () => {
    renderApp();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('shows user info and logout when authenticated', () => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Test User', email: 'test@example.com' }));
    
    renderApp();
    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('shows Cart and Orders links when authenticated', () => {
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }));
    
    renderApp();
    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('handles logout correctly', async () => {
    const user = userEvent.setup();
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }));
    
    renderApp();
    
    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
  });
});
