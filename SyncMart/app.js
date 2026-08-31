var express = require("express");
var app = express();

var session = require("express-session");
var conn = require("./dbconfig");

app.set("view engine", "ejs");

app.use(
  session({
    secret: "syncmart-secret",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use("/public", express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Home-Page

app.get("/home", function (req, res) {
  const sql = "SELECT * FROM products";

  conn.query(sql, function (err, result) {
    if (err) {
      console.log("Home products error:", err);
      return res.status(500).send("Database error");
    }

    res.render("home", {
      products: result,
    });
  });
});

// Products

app.get("/products", function (req, res) {
  console.log("Products route opened");

  const sql = "SELECT * FROM products";

  conn.query(sql, function (err, result) {
    if (err) {
      console.log(err);

      return res.send("Database error");
    }

    res.render("products", {
      products: result,
    });
  });
});

// Product Details

app.get("/product/:id", function (req, res) {
  const productId = req.params.id;

  const sql = `
        SELECT *
        FROM products
        WHERE id = ?
    `;

  conn.query(sql, [productId], function (err, result) {
    if (err) {
      console.log(err);

      return res.send("Database error");
    }

    if (result.length === 0) {
      return res.send("Product not found");
    }

    res.render("product-details", {
      product: result[0],
    });
  });
});

// Category

app.get("/category/:id", function (req, res) {
  const categoryId = req.params.id;

  console.log("Category route opened for category ID:", categoryId);

  const sql = `
        SELECT *
        FROM products
        WHERE category_id = ?
    `;

  conn.query(sql, [categoryId], function (err, result) {
    if (err) {
      console.log(err);

      return res.send("Database error");
    }

    res.render("products", {
      products: result,
    });
  });
});

// Categories

app.get("/categories", function (req, res) {
  console.log("Categories route opened");

  res.render("categories", {
    products: [],
  });
});

// Wishlist

app.get("/wishlist", function (req, res) {
  const wishlist = req.session.wishlist || [];

  if (wishlist.length === 0) {
    return res.render("wishlist", {
      products: [],
    });
  }

  const sql = `
        SELECT *
        FROM products
        WHERE id IN (?)
    `;

  conn.query(sql, [wishlist], function (err, result) {
    if (err) {
      console.log(err);

      return res.send("Database error");
    }

    res.render("wishlist", {
      products: result,
    });
  });
});

// Add to wishlist

app.post("/wishlist/add/:id", function (req, res) {
  const productId = req.params.id;

  if (!req.session.wishlist) {
    req.session.wishlist = [];
  }

  // Prevent duplicate products

  if (!req.session.wishlist.includes(productId)) {
    req.session.wishlist.push(productId);
  }

  console.log("Product added to wishlist:", productId);

  res.redirect("/wishlist");
});

// Remove from whishlist

app.post("/wishlist/remove/:id", function (req, res) {
  const productId = Number(req.params.id);

  let wishlist = req.session.wishlist || [];

  wishlist = wishlist.filter(function (id) {
    return Number(id) !== productId;
  });

  req.session.wishlist = wishlist;

  res.redirect("/wishlist");
});

// Cart

app.get("/cart", function (req, res) {
  const cart = req.session.cart || [];

  console.log("Cart:", cart);

  //  Empty cart

  if (cart.length === 0) {
    return res.render("cart", {
      products: [],

      cart: [],

      total: 0,
    });
  }

  // Get unique product ID

  const productIds = [...new Set(cart)];

  //  Get products from database

  const sql = `
        SELECT *
        FROM products
        WHERE id IN (?)
    `;

  conn.query(sql, [productIds], function (err, result) {
    if (err) {
      console.log("Cart database error:", err);

      return res.send("Database error");
    }

    // calculate total

    let total = 0;

    result.forEach(function (product) {
      const quantity = cart.filter(function (id) {
        return Number(id) === Number(product.id);
      }).length;

      total += Number(product.price) * quantity;
    });

    console.log("Cart total:", total);

    // Send data to cart.ejs

    res.render("cart", {
      products: result,

      cart: cart,

      total: total,
    });
  });
});

async function proceedToCheckout() {
  const totalAmount = 2199; // replace with your actual cart total

  const response = await fetch("/api/orders", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      totalAmount: totalAmount,
    }),
  });

  const data = await response.json();

  console.log(data);

  if (!data.success) {
    alert(data.message);

    return;
  }

  alert("Order placed successfully!");

  window.location.href = "/orders";
}

// Add to cart

app.post("/cart/add/:id", function (req, res) {
  const productId = req.params.id;

  if (!req.session.cart) {
    req.session.cart = [];
  }

  req.session.cart.push(productId);

  console.log("Product added to cart:", productId);

  res.redirect("/cart");
});

// Remove from cart

app.post("/cart/remove/:id", function (req, res) {
  const productId = Number(req.params.id);

  let cart = req.session.cart || [];

  // Remove all quantities of this product

  cart = cart.filter(function (id) {
    return Number(id) !== productId;
  });

  req.session.cart = cart;

  res.redirect("/cart");
});

// Sign up page

app.get("/signup", function (req, res) {
  res.render("signup", {
    title: "Sign Up",
  });
});

// Sign up

app.post("/signup", function (req, res) {
  const username = req.body.username;

  const email = req.body.email;

  const password = req.body.password;

  const contact = req.body.contact;

  if (!username || !email || !password || !contact) {
    return res.send("Please fill all fields");
  }

  const sql = `
        INSERT INTO users
        (username, email, password, contact)
        VALUES (?, ?, ?, ?)
    `;

  conn.query(
    sql,
    [username, email, password, contact],
    function (error, results) {
      if (error) {
        console.log(error);

        return res.status(500).send("Database error");
      }

      console.log("User signed up successfully");

      res.redirect("/signin");
    },
  );
});

// Sign in page

app.get("/signin", function (req, res) {
  res.render("signin", {
    title: "Sign In",
  });
});

app.get("/login", function (req, res) {
  res.redirect("/signin");
});

// Sign in

app.post("/signin", function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  console.log("Login attempt:", email);

  if (!email || !password) {
    return res.send("Please enter email and password");
  }

  const sql = `
        SELECT id, username, email, password, contact
        FROM users
        WHERE email = ?
        AND password = ?
    `;

  conn.query(sql, [email, password], function (error, results) {
    if (error) {
      console.log("Login database error:", error);
      return res.status(500).send("Database error");
    }

    if (results.length === 0) {
      return res.send("Incorrect email and/or password");
    }

    const user = results[0];

    console.log("FULL USER:", user);

    // IMPORTANT

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.email = user.email;
    req.session.signedin = true;

    console.log("USER ID BEFORE SAVE:", req.session.userId);

    req.session.save(function (err) {
      if (err) {
        console.log("SESSION SAVE ERROR:", err);

        return res.status(500).send("Session error");
      }

      console.log("USER ID AFTER SAVE:", req.session.userId);

      res.redirect("/home");
    });
  });
});

app.get("/orders", function (req, res) {
  const userId = req.session.userId;

  console.log("Orders page user ID:", userId);

  if (!userId) {
    return res.redirect("/signin");
  }

  res.render("orders");
});

// Get all orders for logged in user

app.get("/api/orders", function (req, res) {
  const userId = req.session.userId;

  console.log("=================================");
  console.log("ORDERS API");
  console.log("User ID:", userId);
  console.log("=================================");

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Please signin first",
    });
  }

  const sql = `
        SELECT
            id,
            total_amount,
            status,
            order_date
        FROM orders
        WHERE user_id = ?
        ORDER BY order_date DESC
    `;

  conn.query(sql, [userId], function (err, results) {
    if (err) {
      console.log("=================================");
      console.log("ORDERS DATABASE ERROR");
      console.log(err);
      console.log("SQL MESSAGE:", err.sqlMessage);
      console.log("SQL:", err.sql);
      console.log("=================================");

      return res.status(500).json({
        success: false,
        message: err.sqlMessage,
      });
    }

    console.log("Orders found:", results);

    res.json({
      success: true,
      orders: results,
    });
  });
});

// Get one order

app.get("/api/orders/:id", function (req, res) {
  const userId = req.session.userId;

  const orderId = req.params.id;

  // Check login

  if (!userId) {
    return res.status(401).json({
      success: false,

      message: "Please signin first",
    });
  }

  const sql = `
        SELECT
            id,
            total_amount,
            status,
            order_date
        FROM orders
        WHERE id = ?
        AND user_id = ?
    `;

  conn.query(sql, [orderId, userId], function (err, results) {
    if (err) {
      console.log("Order details error:", err);

      return res.status(500).json({
        success: false,

        message: "Database error",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,

        message: "Order not found",
      });
    }

    res.json({
      success: true,

      order: results[0],
    });
  });
});

// Create order

app.post("/api/orders", function (req, res) {
  const userId = req.session.userId;

  console.log("================================");
  console.log("CHECKOUT");
  console.log("User ID:", userId);
  console.log("Request body:", req.body);
  console.log("================================");

  // Check if user is signed in

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Please signin first",
    });
  }

  // Get total from checkout

  const totalAmount = req.body.totalAmount;

  // Check total

  if (!totalAmount) {
    return res.status(400).json({
      success: false,
      message: "Total amount is required",
    });
  }

  // Create order in database

  const sql = `
        INSERT INTO orders
        (user_id, total_amount)
        VALUES (?, ?)
    `;

  conn.query(sql, [userId, totalAmount], function (err, result) {
    if (err) {
      console.log("ORDER DATABASE ERROR:");
      console.log(err);

      return res.status(500).json({
        success: false,
        message: err.sqlMessage,
      });
    }

    console.log("Order created:", result.insertId);

    res.status(201).json({
      success: true,

      message: "Order created successfully",

      orderId: result.insertId,
    });
  });
});

app.get("/checkout", function (req, res) {
  const userId = req.session.userId;

  console.log("Checkout user ID:", userId);

  // User must be signed in

  if (!userId) {
    return res.redirect("/signin");
  }

  const cart = req.session.cart || [];

  // Empty cart

  if (cart.length === 0) {
    return res.redirect("/cart");
  }

  const productIds = [...new Set(cart)];

  const sql = `
        SELECT *
        FROM products
        WHERE id IN (?)
    `;

  conn.query(sql, [productIds], function (err, products) {
    if (err) {
      console.log("Checkout database error:", err);
      return res.status(500).send("Database error");
    }

    let total = 0;

    products.forEach(function (product) {
      const quantity = cart.filter(function (id) {
        return Number(id) === Number(product.id);
      }).length;

      total += product.price * quantity;
    });

    res.render("checkout", {
      products: products,
      cart: cart,
      total: total,
    });
  });
});

// Search

app.get("/search", function (req, res) {
  const searchQuery = req.query.query;

  if (!searchQuery || searchQuery.trim() === "") {
    return res.redirect("/products");
  }

  const search = `%${searchQuery}%`;

  const sql = `
        SELECT *
        FROM products
        WHERE name LIKE ?
        OR brand LIKE ?
        OR model LIKE ?
        OR description LIKE ?
        OR processor LIKE ?
        OR ram LIKE ?
        OR storage LIKE ?
        OR os LIKE ?
    `;

  conn.query(
    sql,
    [search, search, search, search, search, search, search, search],
    function (err, result) {
      if (err) {
        console.log(err);

        return res.send("Database error");
      }

      console.log("Search:", searchQuery);

      console.log("Products found:", result.length);

      res.render("products", {
        products: result,

        searchQuery: searchQuery,
      });
    },
  );
});

app.get("/test-session", function (req, res) {
  console.log("================================");
  console.log("SESSION TEST");
  console.log("Session ID:", req.sessionID);
  console.log("User ID:", req.session.userId);
  console.log("Username:", req.session.username);
  console.log("Email:", req.session.email);
  console.log("Signed in:", req.session.signedin);
  console.log("================================");

  res.json({
    sessionId: req.sessionID,
    userId: req.session.userId,
    username: req.session.username,
    email: req.session.email,
    signedin: req.session.signedin,
  });
});

// Profile

app.get("/profile", function (req, res) {
  const userId = req.session.userId;

  console.log("Profile user ID:", userId);

  // Check if user is logged in

  if (!userId) {
    return res.redirect("/signin");
  }

  const sql = `
        SELECT
            id,
            username,
            email,
            contact
        FROM users
        WHERE id = ?
    `;

  conn.query(sql, [userId], function (err, results) {
    if (err) {
      console.log("Profile database error:", err);

      return res.status(500).send("Database error");
    }

    if (results.length === 0) {
      return res.status(404).send("User not found");
    }

    console.log("Profile user:", results[0]);

    res.render("profile", {
      user: results[0],
    });
  });
});

// Start server

app.listen(3000, function () {
  console.log("Server is running on http://localhost:3000");
});
