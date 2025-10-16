import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setOrders);
  }, [navigate]);

  return (
    <div>
      <h2>My Orders</h2>
      {!orders.length ? (
        <p>No orders yet</p>
      ) : (
        orders.map(order => (
          <div key={order._id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {order.status}</p>
              </div>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${order.total.toFixed(2)}</p>
              </div>
            </div>
            <div>
              <strong>Items:</strong>
              {order.items.map((item, idx) => (
                <p key={idx}>- Quantity: {item.quantity} @ ${item.price}</p>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
