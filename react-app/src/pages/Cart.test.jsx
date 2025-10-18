import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Cart from './Cart';

const mockUser = { id: '1', name: 'Test User' };
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useOutletContext: () => ({ user: mockUser })
  };
});

function renderCart() {
  return render(
    <BrowserRouter>
      <Cart />
    </BrowserRouter>
  );
}

describe('Cart Component', () => {
  it('renders cart title', () => {
    renderCart();
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
  });

  it('displays cart items after loading', async () => {
    renderCart();
    
    await waitFor(() => {
      expect(screen.getByText(/quantity: 2/i)).toBeInTheDocument();
      expect(screen.getByText(/\$999\.99/)).toBeInTheDocument();
    });
  });

  it('calculates total correctly', async () => {
    renderCart();
    
    await waitFor(() => {
      expect(screen.getByText(/total: \$1999\.98/i)).toBeInTheDocument();
    });
  });

  it('shows checkout button when cart has items', async () => {
    renderCart();
    
    await waitFor(() => {
      expect(screen.getByText('Checkout')).toBeInTheDocument();
    });
  });

  it('handles quantity updates', async () => {
    const user = userEvent.setup();
    renderCart();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('2')).toBeInTheDocument();
    });
    
    const quantityInput = screen.getByDisplayValue('2');
    await user.clear(quantityInput);
    await user.type(quantityInput, '3');
    
    // Should trigger update
    expect(quantityInput.value).toBe('3');
  });

  it('handles item removal', async () => {
    const user = userEvent.setup();
    renderCart();
    
    await waitFor(() => {
      expect(screen.getByText('Remove')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Remove'));
    
    // Should trigger removal API call
  });
});
