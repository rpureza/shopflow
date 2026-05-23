import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await axios.get("https://shopflow-production-3186.up.railway.app/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const removeItem = async (id) => {
    await axios.delete(`https://shopflow-production-3186.up.railway.app/cart/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCart();
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    await axios.put(`https://shopflow-production-3186.up.railway.app/cart/${id}`,
      { quantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchCart();
  };

  const total = cart.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

  if (loading) return <div style={styles.loading}>Loading cart...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🛒 Your Cart</h1>
      {cart.length === 0 ? (
        <p style={styles.empty}>Your cart is empty!</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.id} style={styles.card}>
              {item.image && <img src={item.image} alt={item.name} style={styles.image} />}
              <div style={styles.info}>
                <h3 style={styles.name}>{item.name}</h3>
                <p style={styles.price}>${item.price} each</p>
                <div style={styles.quantityRow}>
                  <button style={styles.qBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span style={styles.quantity}>{item.quantity}</span>
                  <button style={styles.qBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <p style={styles.subtotal}>Subtotal: ${parseFloat(item.subtotal).toFixed(2)}</p>
              </div>
              <button style={styles.removeBtn} onClick={() => removeItem(item.id)}>✕</button>
            </div>
          ))}
          <div style={styles.totalRow}>
            <h2 style={styles.total}>Total: ${total.toFixed(2)}</h2>
            <button style={styles.checkoutBtn} onClick={() => navigate("/checkout")}>
              Proceed to Checkout 💳
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "2rem", backgroundColor: "#0f0f1a", minHeight: "100vh" },
  title: { color: "white", textAlign: "center", marginBottom: "2rem" },
  empty: { color: "#a0a0b0", textAlign: "center", fontSize: "1.2rem" },
  loading: { color: "white", textAlign: "center", padding: "2rem" },
  card: { backgroundColor: "#1a1a2e", borderRadius: "8px", padding: "1rem",
    marginBottom: "1rem", maxWidth: "700px", margin: "0 auto 1rem",
    display: "flex", alignItems: "center", gap: "1rem" },
  image: { width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px" },
  info: { flex: 1 },
  name: { color: "white", marginBottom: "0.25rem" },
  price: { color: "#a0a0b0", fontSize: "0.9rem" },
  quantityRow: { display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.5rem 0" },
  qBtn: { backgroundColor: "#e94560", color: "white", border: "none",
    borderRadius: "4px", width: "28px", height: "28px", cursor: "pointer", fontSize: "1rem" },
  quantity: { color: "white", fontSize: "1rem", minWidth: "20px", textAlign: "center" },
  subtotal: { color: "#e94560", fontWeight: "bold" },
  removeBtn: { backgroundColor: "transparent", color: "#a0a0b0", border: "none",
    fontSize: "1.2rem", cursor: "pointer" },
  totalRow: { maxWidth: "700px", margin: "1.5rem auto", display: "flex",
    justifyContent: "space-between", alignItems: "center" },
  total: { color: "white" },
  checkoutBtn: { backgroundColor: "#e94560", color: "white", border: "none",
    padding: "0.75rem 1.5rem", borderRadius: "4px", cursor: "pointer", fontSize: "1rem" },
};

export default Cart;