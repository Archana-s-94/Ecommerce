const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");

const conn = require("./dbconfig");

const app = express();

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

// MAKE SESSION AVAILABLE TO ALL EJS PAGES

app.use(function (req, res, next) {
  res.locals.signedin = req.session.signedin || false;
  res.locals.username = req.session.username || null;
  res.locals.userId = req.session.userId || null;

  next();
});

// ========================================
// LOGIN PROTECTION MIDDLEWARE
// ========================================

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/signin");
  }

  next();
}

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

// ========================================
// WISHLIST - DATABASE BASED
// ========================================

// View wishlist
app.get("/wishlist", requireLogin, function (req, res) {
  const userId = req.session.userId;

  const sql = `
    SELECT products.*
    FROM wishlist
    JOIN products
      ON wishlist.product_id = products.id
    WHERE wishlist.user_id = ?
    ORDER BY wishlist.created_at DESC
  `;

  conn.query(sql, [userId], function (err, result) {
    if (err) {
      console.log("Wishlist database error:", err);
      return res.status(500).send("Database error");
    }

    res.render("wishlist", {
      products: result,
    });
  });
});

// Add product to wishlist
app.post("/wishlist/add/:id", requireLogin, function (req, res) {
  const userId = req.session.userId;
  const productId = req.params.id;

  const sql = `
    INSERT IGNORE INTO wishlist
    (user_id, product_id)
    VALUES (?, ?)
  `;

  conn.query(sql, [userId, productId], function (err) {
    if (err) {
      console.log("Add wishlist error:", err);
      return res.status(500).send("Database error");
    }

    console.log("Product added to wishlist:", productId, "User:", userId);

    res.redirect("/wishlist");
  });
});

// Remove product from wishlist
app.post("/wishlist/remove/:id", requireLogin, function (req, res) {
  const userId = req.session.userId;
  const productId = req.params.id;

  const sql = `
    DELETE FROM wishlist
    WHERE user_id = ?
    AND product_id = ?
  `;

  conn.query(sql, [userId, productId], function (err) {
    if (err) {
      console.log("Remove wishlist error:", err);
      return res.status(500).send("Database error");
    }

    console.log("Product removed from wishlist:", productId, "User:", userId);

    res.redirect("/wishlist");
  });
});

// ========================================
// VIEW DATABASE CART
// ========================================

app.get("/cart", requireLogin, function (req, res) {
  const userId = req.session.userId;

  const sql = `
    SELECT
      products.*,
      cart.quantity
    FROM cart
    JOIN products
      ON cart.product_id = products.id
    WHERE cart.user_id = ?
    ORDER BY cart.created_at DESC
  `;

  conn.query(sql, [userId], function (err, results) {
    if (err) {
      console.log("Cart database error:", err);

      return res.status(500).send("Database error");
    }

    let total = 0;

    results.forEach(function (product) {
      total += Number(product.price) * Number(product.quantity);
    });

    console.log("Database cart:", results);

    console.log("Cart total:", total);

    res.render("cart", {
      products: results,

      total: total,
    });
  });
});

// ========================================
// ADD PRODUCT TO DATABASE CART
// ========================================

app.post("/cart/add/:id", requireLogin, function (req, res) {
  const userId = req.session.userId;
  const productId = req.params.id;

  // First check the product and its stock

  const productSql = `
      SELECT id, stock
      FROM products
      WHERE id = ?
    `;

  conn.query(productSql, [productId], function (productError, productResult) {
    if (productError) {
      console.log("Product lookup error:", productError);

      return res.status(500).send("Database error");
    }

    if (productResult.length === 0) {
      return res.status(404).send("Product not found");
    }

    const stock = Number(productResult[0].stock);

    if (stock <= 0) {
      return res.redirect("/products");
    }

    // Check whether this product is already
    // in this user's cart

    const checkSql = `
          SELECT id, quantity
          FROM cart
          WHERE user_id = ?
          AND product_id = ?
        `;

    conn.query(
      checkSql,
      [userId, productId],
      function (checkError, cartResult) {
        if (checkError) {
          console.log("Cart check error:", checkError);

          return res.status(500).send("Database error");
        }

        // Product already exists in cart

        if (cartResult.length > 0) {
          const currentQuantity = Number(cartResult[0].quantity);

          // Do not exceed available stock

          if (currentQuantity >= stock) {
            return res.redirect("/cart");
          }

          const updateSql = `
                UPDATE cart
                SET quantity = quantity + 1
                WHERE user_id = ?
                AND product_id = ?
              `;

          conn.query(updateSql, [userId, productId], function (updateError) {
            if (updateError) {
              console.log("Cart update error:", updateError);

              return res.status(500).send("Database error");
            }

            console.log("Cart quantity increased:", productId);

            return res.redirect("/cart");
          });
        } else {
          // Product is not in cart yet

          const insertSql = `
                INSERT INTO cart
                (user_id, product_id, quantity)
                VALUES (?, ?, 1)
              `;

          conn.query(insertSql, [userId, productId], function (insertError) {
            if (insertError) {
              console.log("Add to cart error:", insertError);

              return res.status(500).send("Database error");
            }

            console.log("Product added to database cart:", productId);

            return res.redirect("/cart");
          });
        }
      },
    );
  });
});

// Increase cart quantity

// ========================================
// INCREASE CART QUANTITY
// ========================================

app.post("/cart/increase/:id", requireLogin, function (req, res) {
  const userId = req.session.userId;
  const productId = req.params.id;

  const sql = `
        UPDATE cart
        SET quantity = quantity + 1
        WHERE user_id = ?
        AND product_id = ?
    `;

  conn.query(sql, [userId, productId], function (err, result) {
    if (err) {
      console.log("Increase cart error:", err);
      return res.status(500).send("Database error");
    }

    console.log("Cart quantity increased:", productId);

    res.redirect("/cart");
  });
});

// Decrease cart quantity

// ========================================
// DECREASE CART QUANTITY
// ========================================

app.post("/cart/decrease/:id", requireLogin, function (req, res) {
  const userId = req.session.userId;
  const productId = req.params.id;

  const checkSql = `
        SELECT quantity
        FROM cart
        WHERE user_id = ?
        AND product_id = ?
    `;

  conn.query(checkSql, [userId, productId], function (err, result) {
    if (err) {
      console.log("Decrease cart check error:", err);
      return res.status(500).send("Database error");
    }

    if (result.length === 0) {
      return res.redirect("/cart");
    }

    const currentQuantity = Number(result[0].quantity);

    if (currentQuantity > 1) {
      const updateSql = `
                    UPDATE cart
                    SET quantity = quantity - 1
                    WHERE user_id = ?
                    AND product_id = ?
                `;

      conn.query(updateSql, [userId, productId], function (updateError) {
        if (updateError) {
          console.log("Decrease cart error:", updateError);

          return res.status(500).send("Database error");
        }

        return res.redirect("/cart");
      });
    } else {
      // quantity is 1, remove the item completely

      const deleteSql = `
                    DELETE FROM cart
                    WHERE user_id = ?
                    AND product_id = ?
                `;

      conn.query(deleteSql, [userId, productId], function (deleteError) {
        if (deleteError) {
          console.log("Delete cart item error:", deleteError);

          return res.status(500).send("Database error");
        }

        return res.redirect("/cart");
      });
    }
  });
});

// Remove from cart

// ========================================
// REMOVE PRODUCT FROM CART
// ========================================

app.post("/cart/remove/:id", requireLogin, function (req, res) {
  const userId = req.session.userId;
  const productId = req.params.id;

  const sql = `
        DELETE FROM cart
        WHERE user_id = ?
        AND product_id = ?
    `;

  conn.query(sql, [userId, productId], function (err) {
    if (err) {
      console.log("Remove cart error:", err);
      return res.status(500).send("Database error");
    }

    res.redirect("/cart");
  });
});

// Sign up page

app.get("/signup", function (req, res) {
  res.render("signup", {
    error: null,
  });
});

// Sign up

app.post("/signup", async function (req, res) {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const contact = req.body.contact;

  if (!username || !email || !password || !contact) {
    return res.render("signup", {
      error: "Please fill in all fields.",
    });
  }

  const checkSql = `
    SELECT id
    FROM users
    WHERE email = ?
  `;

  conn.query(checkSql, [email], async function (err, result) {
    if (err) {
      console.log("Email check error:", err);

      return res.status(500).send("Database error");
    }

    if (result.length > 0) {
      return res.render("signup", {
        error: "Email already registered.",
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertSql = `
          INSERT INTO users
          (
            username,
            email,
            password,
            contact
          )
          VALUES (?, ?, ?, ?)
        `;

      conn.query(
        insertSql,
        [username, email, hashedPassword, contact],
        function (insertErr) {
          if (insertErr) {
            console.log("Signup error:", insertErr);

            return res.status(500).send("Unable to create account");
          }

          res.redirect("/signin");
        },
      );
    } catch (hashError) {
      console.log("Password hash error:", hashError);

      res.status(500).send("Unable to create account");
    }
  });
});

// Sign in page

app.get("/signin", function (req, res) {
  if (req.session.userId) {
    return res.redirect("/home");
  }

  res.render("signin", {
    error: null,
  });
});

// Sign in

app.post("/signin", function (req, res) {
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    return res.render("signin", {
      error: "Please enter your email and password.",
    });
  }

  const sql = `
    SELECT *
    FROM users
    WHERE email = ?
  `;

  conn.query(sql, [email], async function (err, result) {
    if (err) {
      console.log("Signin database error:", err);

      return res.status(500).send("Database error");
    }

    if (result.length === 0) {
      return res.render("signin", {
        error: "Invalid email or password.",
      });
    }

    const user = result[0];

    try {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.render("signin", {
          error: "Invalid email or password.",
        });
      }

      req.session.userId = user.id;

      req.session.username = user.username;

      req.session.email = user.email;

      req.session.signedin = true;

      req.session.save(function (sessionError) {
        if (sessionError) {
          console.log("Session save error:", sessionError);

          return res.status(500).send("Unable to create session");
        }

        res.redirect("/home");
      });
    } catch (passwordError) {
      console.log("Password compare error:", passwordError);

      res.status(500).send("Unable to sign in");
    }
  });
});

// SignOut Page
app.post("/signout", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.log("Signout error:", err);

      return res.status(500).send("Unable to sign out");
    }

    res.clearCookie("connect.sid");

    res.redirect("/home");
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

// ========================================
// GET ALL ORDERS WITH ORDER ITEMS
// ========================================

app.get("/api/orders", requireLogin, function (req, res) {
  const userId = req.session.userId;

  const ordersSql = `
    SELECT
      id,
      total_amount,
      status,
      order_date
    FROM orders
    WHERE user_id = ?
    ORDER BY order_date DESC
  `;

  conn.query(ordersSql, [userId], function (ordersError, orders) {
    if (ordersError) {
      console.log("Orders database error:", ordersError);

      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (orders.length === 0) {
      return res.json({
        success: true,
        orders: [],
      });
    }

    const orderIds = orders.map(function (order) {
      return order.id;
    });

    const itemsSql = `
        SELECT
          order_items.order_id,
          order_items.product_id,
          order_items.quantity,
          order_items.price,
          products.name,
          products.brand,
          products.image
        FROM order_items
        JOIN products
          ON order_items.product_id = products.id
        WHERE order_items.order_id IN (?)
        ORDER BY order_items.id ASC
      `;

    conn.query(itemsSql, [orderIds], function (itemsError, items) {
      if (itemsError) {
        console.log("Order items database error:", itemsError);

        return res.status(500).json({
          success: false,
          message: "Database error",
        });
      }

      const ordersWithItems = orders.map(function (order) {
        const orderItems = items.filter(function (item) {
          return Number(item.order_id) === Number(order.id);
        });

        return {
          id: order.id,
          total_amount: order.total_amount,
          status: order.status,
          order_date: order.order_date,
          items: orderItems,
        };
      });

      return res.json({
        success: true,
        orders: ordersWithItems,
      });
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

// ========================================
// PLACE ORDER FROM DATABASE CART
// ========================================

app.post("/api/orders", requireLogin, function (req, res) {
  const userId = req.session.userId;

  // 1. Get all products from this user's cart
  const cartSql = `
    SELECT
      cart.product_id,
      cart.quantity,
      products.price
    FROM cart
    JOIN products
      ON cart.product_id = products.id
    WHERE cart.user_id = ?
  `;

  conn.query(cartSql, [userId], function (cartError, cartItems) {
    if (cartError) {
      console.log("Order cart error:", cartError);

      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    // Prevent empty order
    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    // 2. Calculate total on the server
    let totalAmount = 0;

    cartItems.forEach(function (item) {
      totalAmount += Number(item.price) * Number(item.quantity);
    });

    // 3. Create main order
    const orderSql = `
      INSERT INTO orders
        (user_id, total_amount, status)
      VALUES (?, ?, ?)
    `;

    conn.query(
      orderSql,
      [userId, totalAmount, "Pending"],
      function (orderError, orderResult) {
        if (orderError) {
          console.log("Create order error:", orderError);

          return res.status(500).json({
            success: false,
            message: "Could not create order",
          });
        }

        const orderId = orderResult.insertId;

        console.log("Order created:", orderId);

        // 4. Prepare order_items data
        const orderItems = cartItems.map(function (item) {
          return [orderId, item.product_id, item.quantity, item.price];
        });

        // 5. Save every cart product into order_items
        const orderItemsSql = `
          INSERT INTO order_items
            (order_id, product_id, quantity, price)
          VALUES ?
        `;

        conn.query(orderItemsSql, [orderItems], function (itemsError) {
          if (itemsError) {
            console.log("Order items error:", itemsError);

            return res.status(500).json({
              success: false,
              message: "Order created but order items could not be saved",
            });
          }

          console.log("Order items saved:", orderItems);

          // 6. Clear this user's cart
          const clearCartSql = `
              DELETE FROM cart
              WHERE user_id = ?
            `;

          conn.query(clearCartSql, [userId], function (clearError) {
            if (clearError) {
              console.log("Clear cart error:", clearError);

              return res.status(500).json({
                success: false,
                message: "Order created but cart could not be cleared",
              });
            }

            console.log("Database cart cleared for user:", userId);

            // 7. Send success response
            return res.json({
              success: true,
              message: "Order placed successfully",
              orderId: orderId,
            });
          });
        });
      },
    );
  });
});

// ========================================
// DATABASE CHECKOUT
// ========================================

app.get("/checkout", requireLogin, function (req, res) {
  const userId = req.session.userId;

  const sql = `
    SELECT
      products.*,
      cart.quantity
    FROM cart
    JOIN products
      ON cart.product_id = products.id
    WHERE cart.user_id = ?
    ORDER BY cart.created_at DESC
  `;

  conn.query(sql, [userId], function (err, products) {
    if (err) {
      console.log("Checkout database error:", err);
      return res.status(500).send("Database error");
    }

    if (products.length === 0) {
      return res.redirect("/cart");
    }

    let total = 0;

    products.forEach(function (product) {
      total += Number(product.price) * Number(product.quantity);
    });

    res.render("checkout", {
      products: products,
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
