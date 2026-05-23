const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

// GET ALL PRODUCTS
router.get("/", (req, res) => {
  db.query("SELECT * FROM products ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });
    res.json(results);
  });
});

// GET SINGLE PRODUCT
router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM products WHERE id = ?",
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length === 0)
        return res.status(404).json({ message: "Product not found" });
      res.json(results[0]);
    }
  );
});

// ADD PRODUCT (admin only for now)
router.post("/", auth, (req, res) => {
  const { name, description, price, image, stock } = req.body;

  if (!name || !price)
    return res.status(400).json({ message: "Name and price are required" });

  db.query(
    "INSERT INTO products (name, description, price, image, stock) VALUES (?, ?, ?, ?, ?)",
    [name, description, price, image, stock || 0],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.status(201).json({ message: "Product added", id: result.insertId });
    }
  );
});

// UPDATE PRODUCT
router.put("/:id", auth, (req, res) => {
  const { name, description, price, image, stock } = req.body;

  db.query(
    "UPDATE products SET name=?, description=?, price=?, image=?, stock=? WHERE id=?",
    [name, description, price, image, stock, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Product updated" });
    }
  );
});

// DELETE PRODUCT
router.delete("/:id", auth, (req, res) => {
  db.query(
    "DELETE FROM products WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "Server error" });
      res.json({ message: "Product deleted" });
    }
  );
});

module.exports = router;