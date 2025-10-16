import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [products, setProducts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('/api/cart', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setCart(data);
        return Promise.all(
          data.items?.map(item =>
            fetch(`/api/products/${item.productId}`).then(r => r.json())
          ) || []
        );
      })
      .then(productData => {
        const productMap = {};
        productData.forEach(p => productMap[p._id] = p);
        setProducts(productMap);
      });
  }, [navigate]);

  const updateQuantity = async (productId, quantity) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/cart/items/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    });
    window.location.reload();
  };

  const removeItem = async (productId) => {
    const token = localStorage.getItem('token');
    await fetch(`/api/cart/items/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    window.location.reload();
  };

  const checkout = async () => {
    const token = localStorage.getItem('token');
    const items = cart.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    }));

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items,
        shippingAddress: { street: '123 Main St', city: 'City', state: 'ST', zip: '12345', country: 'US' }
      })
    });

    if (res.ok) {
      alert('Order placed!');
      navigate('/orders');
    }
  };

  const total = cart.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  return (
    <div>
      <h2>Shopping Cart</h2>
      {!cart.items?.length ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cart.items.map(item => {
            const product = products[item.productId];
            return (
              <div key={item.productId} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3>{product?.name}</h3>
                  <p>${item.price} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                  <button onClick={() => removeItem(item.productId)} style={{ marginLeft: '1rem' }}>Remove</button>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: '2rem', textAlign: 'right' }}>
            <h3>Total: ${total.toFixed(2)}</h3>
            <button onClick={checkout} style={{ padding: '1rem 2rem', cursor: 'pointer', fontSize: '1rem' }}>
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
