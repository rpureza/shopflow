const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

// GET USER ORDERS
router.get("/", auth, (req, res) => {
  db.query(
    `SELECT orders.id, orders.total, orders.status, 
     orders.stripe_payment_id, orders.created_at
     FROM orders 
     WHERE orders.user_id = ?
     ORDER BY orders.created_at DESC`,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json(results);
    }
  );
});

// GET SINGLE ORDER WITH ITEMS
router.get("/:id", auth, (req, res) => {
  db.query(
    `SELECT orders.id, orders.total, orders.status,
     orders.stripe_payment_id, orders.created_at,
     order_items.quantity, order_items.price,
     products.name, products.image
     FROM orders
     JOIN order_items ON orders.id = order_items.order_id
     JOIN products ON order_items.product_id = products.id
     WHERE orders.id = ? AND orders.user_id = ?`,
    [req.params.id, req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length === 0)
        return res.status(404).json({ message: "Order not found" });
      res.json(results);
    }
  );
});

// CREATE ORDER
router.post("/", auth, (req, res) => {
  const { items, total, stripe_payment_id } = req.body;

  if (!items || items.length === 0)
    return res.status(400).json({ message: "No items in order" });

  db.query(
    "INSERT INTO orders (user_id, total, status, stripe_payment_id) VALUES (?, ?, 'paid', ?)",
    [req.user.id, total, stripe_payment_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });

      const orderId = result.insertId;
      const orderItems = items.map((item) => [
        orderId,
        item.product_id,
        item.quantity,
        item.price,
      ]);

      db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
        [orderItems],
        (err) => {
          if (err) return res.status(500).json({ message: "Server error" });

          // Clear cart after order
          db.query(
            "DELETE FROM cart WHERE user_id = ?",
            [req.user.id],
            (err) => {
              if (err) console.error("Error clearing cart:", err);
            }
          );

          res.status(201).json({
            message: "Order created successfully",
            orderId,
          });
        }
      );
    }
  );
});

module.exports = router;