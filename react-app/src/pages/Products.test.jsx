import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Products from './Products';

const mockUser = { id: '1', name: 'Test User' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: () => ({ user: mockUser })
  };
});

function renderProducts() {
  return render(
    <BrowserRouter>
      <Products />
    </BrowserRouter>
  );
}

describe('Products Component', () => {
  it('renders loading state initially', () => {
    renderProducts();
    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('displays products after loading', async () => {
    renderProducts();
    
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
      expect(screen.getByText('Phone')).toBeInTheDocument();
    });
  });

  it('displays product details correctly', async () => {
    renderProducts();
    
    await waitFor(() => {
      expect(screen.getByText('$999.99')).toBeInTheDocument();
      expect(screen.getByText('Stock: 10')).toBeInTheDocument();
    });
  });

  it('handles add to cart for authenticated user', async () => {
    const user = userEvent.setup();
    renderProducts();
    
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });
    
    const addToCartButtons = screen.getAllByText('Add to Cart');
    await user.click(addToCartButtons[0]);
    
    // Should not show login alert since user is authenticated
    expect(screen.queryByText('Please login to add items to cart')).not.toBeInTheDocument();
  });

  it('shows category filter', async () => {
    renderProducts();
    
    await waitFor(() => {
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    });
  });

  it('shows search input', async () => {
    renderProducts();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument();
    });
  });
});
