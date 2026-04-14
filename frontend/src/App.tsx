import { useState, useEffect } from 'react';
import api from './api';
import './App.css';

interface Product {
  _id: string;
  name: string;
  price: number;
}

interface OrderItem {
  productId: string;
  quantity: number;
  product?: Product;
}

interface Order {
  _id: string;
  userId: string;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Forms state
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('1');

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000); // Poll for status changes
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch {
      console.error('Error fetching products');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch {
      console.error('Error fetching orders');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        name: newProductName,
        price: Number(newProductPrice),
      });
      setNewProductName('');
      setNewProductPrice('');
      fetchProducts();
    } catch {
      alert('Error creating product');
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    try {
      setLoading(true);
      // Hardcoded userId for demo
      const userId = '660000000000000000000001';
      await api.post('/orders', {
        userId,
        items: [
          { productId: selectedProductId, quantity: Number(orderQuantity) },
        ],
      });
      fetchOrders();
    } catch {
      alert('Error creating order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>📦 Order & Notification Demo</h1>

      <section>
        <h2>🛠 Product Management</h2>
        <form onSubmit={handleCreateProduct}>
          <input
            placeholder="Product Name"
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={newProductPrice}
            onChange={(e) => setNewProductPrice(e.target.value)}
            required
          />
          <button type="submit">Add Product</button>
        </form>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p._id}</td>
                <td>{p.name}</td>
                <td>${p.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>🛒 Create Order</h2>
        <form onSubmit={handleCreateOrder}>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
          >
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} (${p.price})
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={orderQuantity}
            onChange={(e) => setOrderQuantity(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Place Order'}
          </button>
        </form>
      </section>

      <section>
        <h2>📋 Orders List</h2>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o._id}</td>
                <td className={`status-${o.status}`}>
                  {o.status.toUpperCase()}
                </td>
                <td>{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <OrderDetailSection />
    </div>
  );
}

function OrderDetailSection() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);

  const fetchDetail = async () => {
    if (!orderId) return;
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch {
      alert('Order not found or error fetching details');
    }
  };

  return (
    <section>
      <h2>🔍 Order Details (Aggregation)</h2>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <input
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <button onClick={fetchDetail}>Fetch Enriched Details</button>
      </div>

      {order && (
        <div
          style={{ marginTop: '1rem', padding: '1rem', background: '#f9f9f9' }}
        >
          <h3>Order {order._id}</h3>
          <p>
            Status: <strong>{order.status}</strong>
          </p>
          <ul>
            {order.items.map((item: OrderItem, idx: number) => (
              <li key={idx}>
                <strong>{item.product?.name}</strong> - Quantity:{' '}
                {item.quantity} - Price: ${item.product?.price}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default App;
