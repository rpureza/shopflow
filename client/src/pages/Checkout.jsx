import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useAuth } from "../context/AuthContext";

const stripePromise = loadStripe("pk_test_51Ta2wTRqkrioo8oBAEjefdWCjqkVXpgsXnipZIjJ1a1jJfaw4Cr9Nlh2vRs0dUPbwtvdAurQpK9FANpk4nGLt98m005qX3W9UK"
);

const CheckoutForm = ({ cart, total }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create payment intent
      const { data } = await axios.post(
        "http://localhost:3003/payment/create-payment-intent",
        { amount: total },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Confirm payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      // Create order
      const items = cart.map((item) => ({
        product_id: item.product_id || item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      await axios.post(
        "http://localhost:3003/orders",
        { items, total, stripe_payment_id: result.paymentIntent.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Payment successful! 🎉");
      setTimeout(() => navigate("/orders"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={styles.cardElement}>
        <CardElement options={{ style: { base: { color: "white", fontSize: "16px" } } }} />
      </div>
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}
      <button style={styles.button} type="submit" disabled={!stripe || loading}>
        {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
};

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    axios.get("http://localhost:3003/cart", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => { setCart(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const total = cart.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>💳 Checkout</h1>
        <div style={styles.summary}>
          {cart.map((item) => (
            <div key={item.id} style={styles.item}>
              <span style={styles.itemName}>{item.name} x{item.quantity}</span>
              <span style={styles.itemPrice}>${parseFloat(item.subtotal).toFixed(2)}</span>
            </div>
          ))}
          <div style={styles.totalRow}>
            <span style={styles.totalLabel}>Total</span>
            <span style={styles.totalAmount}>${total.toFixed(2)}</span>
          </div>
        </div>
        <Elements stripe={stripePromise}>
          <CheckoutForm cart={cart} total={total} />
        </Elements>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "2rem", backgroundColor: "#0f0f1a", minHeight: "100vh",
    display: "flex", justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "#1a1a2e", padding: "2rem", borderRadius: "8px",
    width: "100%", maxWidth: "500px" },
  title: { color: "white", textAlign: "center", marginBottom: "1.5rem" },
  summary: { marginBottom: "1.5rem" },
  item: { display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" },
  itemName: { color: "#a0a0b0" },
  itemPrice: { color: "white" },
  totalRow: { display: "flex", justifyContent: "space-between",
    borderTop: "1px solid #333", paddingTop: "0.75rem", marginTop: "0.75rem" },
  totalLabel: { color: "white", fontWeight: "bold", fontSize: "1.1rem" },
  totalAmount: { color: "#e94560", fontWeight: "bold", fontSize: "1.1rem" },
  cardElement: { backgroundColor: "#0f0f1a", padding: "1rem",
    borderRadius: "4px", marginBottom: "1rem" },
  button: { width: "100%", padding: "0.75rem", backgroundColor: "#e94560",
    color: "white", border: "none", borderRadius: "4px", cursor: "pointer",
    fontSize: "1rem", marginTop: "1rem" },
  error: { color: "#e94560", textAlign: "center" },
  success: { color: "#4caf50", textAlign: "center" },
  loading: { color: "white", textAlign: "center", padding: "2rem" },
};

export default Checkout;