import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    axios.get("https://shopflow-production-3186.up.railway.app/products")
      .then((res) => { setProducts(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const addToCart = async (productId) => {
    if (!token) { setMessage("Please login to add to cart!"); return; }
    try {
      await axios.post("https://shopflow-production-3186.up.railway.app/cart",
        { product_id: productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Added to cart! 🛒");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error adding to cart");
    }
  };

  if (loading) return <div style={styles.loading}>Loading products...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🛍️ All Products</h1>
      {message && <p style={styles.message}>{message}</p>}
      {products.length === 0 ? (
        <p style={styles.empty}>No products yet. Check back soon!</p>
      ) : (
        <div style={styles.grid}>
          {products.map((product) => (
            <div key={product.id} style={styles.card}>
              {product.image && (
                <img src={product.image} alt={product.name} style={styles.image} />
              )}
              <div style={styles.info}>
                <h3 style={styles.name}>{product.name}</h3>
                <p style={styles.description}>{product.description}</p>
                <p style={styles.price}>${product.price}</p>
                <p style={styles.stock}>Stock: {product.stock}</p>
                <button
                  style={product.stock > 0 ? styles.button : styles.buttonDisabled}
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock === 0}
                >
                  {product.stock > 0 ? "Add to Cart 🛒" : "Out of Stock"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "2rem", backgroundColor: "#0f0f1a", minHeight: "100vh" },
  title: { color: "white", textAlign: "center", marginBottom: "2rem" },
  message: { color: "#4caf50", textAlign: "center", marginBottom: "1rem" },
  empty: { color: "#a0a0b0", textAlign: "center", fontSize: "1.2rem" },
  loading: { color: "white", textAlign: "center", padding: "2rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "1.5rem", maxWidth: "1200px", margin: "0 auto" },
  card: { backgroundColor: "#1a1a2e", borderRadius: "8px", overflow: "hidden" },
  image: { width: "100%", height: "200px", objectFit: "cover" },
  info: { padding: "1rem" },
  name: { color: "white", marginBottom: "0.5rem" },
  description: { color: "#a0a0b0", fontSize: "0.9rem", marginBottom: "0.5rem" },
  price: { color: "#e94560", fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.5rem" },
  stock: { color: "#a0a0b0", fontSize: "0.85rem", marginBottom: "1rem" },
  button: { width: "100%", padding: "0.75rem", backgroundColor: "#e94560",
    color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
  buttonDisabled: { width: "100%", padding: "0.75rem", backgroundColor: "#555",
    color: "#888", border: "none", borderRadius: "4px", cursor: "not-allowed" },
};

export default Home;