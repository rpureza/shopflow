const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

// GET CART
router.get("/", auth, (req, res) => {
  db.query(
    `SELECT cart.id, cart.quantity, products.name, 
     products.price, products.image,
     (cart.quantity * products.price) as subtotal
     FROM cart 
     JOIN products ON cart.product_id = products.id
     WHERE cart.user_id = ?`,
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json(results);
    }
  );
});

// ADD TO CART
router.post("/", auth, (req, res) => {
  const { product_id, quantity } = req.body;

  if (!product_id)
    return res.status(400).json({ message: "Product ID required" });

  // Check if already in cart
  db.query(
    "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
    [req.user.id, product_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });

      if (results.length > 0) {
        // Update quantity
        db.query(
          "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
          [quantity || 1, req.user.id, product_id],
          (err) => {
            if (err) return res.status(500).json({ message: "Server error" });
            res.json({ message: "Cart updated" });
          }
        );
      } else {
        // Add new item
        db.query(
          "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
          [req.user.id, product_id, quantity || 1],
          (err) => {
            if (err) return res.status(500).json({ message: "Server error" });
            res.status(201).json({ message: "Added to cart" });
          }
        );
      }
    }
  );
});

// UPDATE CART QUANTITY
router.put("/:id", auth, (req, res) => {
  const { quantity } = req.body;

  if (quantity < 1)
    return res.status(400).json({ message: "Quantity must be at least 1" });

  db.query(
    "UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?",
    [quantity, req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Cart updated" });
    }
  );
});

// REMOVE FROM CART
router.delete("/:id", auth, (req, res) => {
  db.query(
    "DELETE FROM cart WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Item removed from cart" });
    }
  );
});

// CLEAR CART
router.delete("/", auth, (req, res) => {
  db.query(
    "DELETE FROM cart WHERE user_id = ?",
    [req.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Cart cleared" });
    }
  );
});

module.exports = router;