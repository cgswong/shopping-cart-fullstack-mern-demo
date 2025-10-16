import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useOutletContext();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const addToCart = async (product) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    const token = localStorage.getItem('token');
    const res = await fetch('/api/cart/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: product._id,
        quantity: 1,
        price: product.price
      })
    });

    if (res.ok) {
      alert('Added to cart!');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Products</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {products.map(product => (
          <div key={product._id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
            {product.imageUrl && (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }}
              />
            )}
            <h3 style={{ fontSize: '1.1rem', margin: '0.5rem 0' }}>{product.name}</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', minHeight: '60px' }}>{product.description}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>${product.price}</p>
            <p style={{ fontSize: '0.9rem', color: product.stock > 0 ? '#28a745' : '#dc3545' }}>
              {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
            </p>
            <button
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              style={{ padding: '0.5rem 1rem', cursor: product.stock > 0 ? 'pointer' : 'not-allowed', width: '100%' }}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
