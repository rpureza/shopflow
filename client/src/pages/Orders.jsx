import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    axios.get("https://shopflow-production-3186.up.railway.app/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => { setOrders(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Loading orders...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📦 Your Orders</h1>
      {orders.length === 0 ? (
        <p style={styles.empty}>No orders yet!</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} style={styles.card}>
            <div style={styles.row}>
              <span style={styles.orderId}>Order #{order.id}</span>
              <span style={
                order.status === "paid" ? styles.statusPaid : styles.statusPending
              }>
                {order.status.toUpperCase()}
              </span>
            </div>
            <p style={styles.total}>Total: ${parseFloat(order.total).toFixed(2)}</p>
            <p style={styles.date}>
              {new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric"
              })}
            </p>
            {order.stripe_payment_id && (
              <p style={styles.paymentId}>
                Payment ID: {order.stripe_payment_id}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: { padding: "2rem", backgroundColor: "#0f0f1a", minHeight: "100vh" },
  title: { color: "white", textAlign: "center", marginBottom: "2rem" },
  empty: { color: "#a0a0b0", textAlign: "center", fontSize: "1.2rem" },
  loading: { color: "white", textAlign: "center", padding: "2rem" },
  card: { backgroundColor: "#1a1a2e", borderRadius: "8px", padding: "1.25rem",
    marginBottom: "1rem", maxWidth: "700px", margin: "0 auto 1rem" },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "0.5rem" },
  orderId: { color: "white", fontWeight: "bold", fontSize: "1.1rem" },
  statusPaid: { backgroundColor: "#4caf50", color: "white", padding: "0.25rem 0.75rem",
    borderRadius: "20px", fontSize: "0.8rem" },
  statusPending: { backgroundColor: "#ff9800", color: "white", padding: "0.25rem 0.75rem",
    borderRadius: "20px", fontSize: "0.8rem" },
  total: { color: "#e94560", fontWeight: "bold", fontSize: "1.1rem", margin: "0.25rem 0" },
  date: { color: "#a0a0b0", fontSize: "0.9rem", margin: "0.25rem 0" },
  paymentId: { color: "#555", fontSize: "0.75rem", marginTop: "0.5rem" },
};

export default Orders;