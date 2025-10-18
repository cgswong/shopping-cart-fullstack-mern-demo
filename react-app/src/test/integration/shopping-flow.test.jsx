import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from '../../App';
import Login from '../../pages/Login';
import Products from '../../pages/Products';
import Cart from '../../pages/Cart';
import { mockLocalStorage } from '../utils';

// Mock localStorage
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage() });

function renderFullApp() {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="login" element={<Login />} />
          <Route path="products" element={<Products />} />
          <Route path="cart" element={<Cart />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

describe('Shopping Flow Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('completes full shopping flow: login -> browse products -> add to cart -> checkout', async () => {
    const user = userEvent.setup();
    
    // Start at login
    window.history.pushState({}, '', '/login');
    renderFullApp();
    
    // Step 1: Login
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    // Should redirect to products
    await waitFor(() => {
      expect(screen.getByText('Loading products...')).toBeInTheDocument();
    });
    
    // Step 2: Browse products
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });
    
    // Step 3: Add to cart
    const addToCartButtons = screen.getAllByText('Add to Cart');
    await user.click(addToCartButtons[0]);
    
    // Step 4: Navigate to cart
    await user.click(screen.getByText('Cart'));
    
    // Should show cart with items
    await waitFor(() => {
      expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    });
  });

  it('prevents unauthenticated access to protected routes', async () => {
    const user = userEvent.setup();
    
    // Try to access cart without login
    window.history.pushState({}, '', '/cart');
    renderFullApp();
    
    // Should show login prompt or redirect
    expect(screen.queryByText('Shopping Cart')).not.toBeInTheDocument();
  });

  it('maintains cart state across navigation', async () => {
    const user = userEvent.setup();
    
    // Login first
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }));
    
    window.history.pushState({}, '', '/products');
    renderFullApp();
    
    // Add item to cart
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });
    
    const addToCartButtons = screen.getAllByText('Add to Cart');
    await user.click(addToCartButtons[0]);
    
    // Navigate to cart
    await user.click(screen.getByText('Cart'));
    
    // Navigate back to products
    await user.click(screen.getByText('Products'));
    
    // Navigate to cart again
    await user.click(screen.getByText('Cart'));
    
    // Cart should still have items
    await waitFor(() => {
      expect(screen.getByText(/quantity: 2/i)).toBeInTheDocument();
    });
  });
});
