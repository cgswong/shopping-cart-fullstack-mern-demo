import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#333', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>Products</Link>
          {user && (
            <>
              <Link to="/cart" style={{ color: 'white', textDecoration: 'none' }}>Cart</Link>
              <Link to="/orders" style={{ color: 'white', textDecoration: 'none' }}>Orders</Link>
            </>
          )}
        </div>
        <div>
          {user ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span>Welcome, {user.name || user.email}</span>
              <button onClick={logout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Logout</button>
            </div>
          ) : (
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
          )}
        </div>
      </nav>
      <main style={{ flex: 1, padding: '2rem' }}>
        <Outlet context={{ user, setUser }} />
      </main>
    </div>
  );
}
