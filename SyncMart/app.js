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
  res.locals.role = req.session.role;
  next();
});

// LOGIN PROTECTION MIDDLEWARE

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/signin");
  }

  next();
}

// REQUIRE ADMIN MIDDLEWARE

function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/signin");
  }

  if (req.session.role !== "admin") {
    return res.status(403).send("Access denied. Admin only.");
  }

  next();
}

// ADMIN DASHBOARD

app.get("/admin", requireAdmin, function (req, res) {
  const productSql = `
    SELECT *
    FROM products
    ORDER BY id DESC
  `;

  conn.query(productSql, function (productError, products) {
    if (productError) {
      console.log("Admin products error:", productError);
      return res.status(500).send("Database error");
    }

    const orderSql = `
      SELECT COUNT(*) AS totalOrders
      FROM orders
    `;

    conn.query(orderSql, function (orderError, orderResult) {
      if (orderError) {
        console.log("Admin orders error:", orderError);
        return res.status(500).send("Database error");
      }

      const customerSql = `
        SELECT COUNT(*) AS totalCustomers
        FROM users
        WHERE role = 'customer'
      `;

      conn.query(customerSql, function (customerError, customerResult) {
        if (customerError) {
          console.log("Admin customers error:", customerError);
          return res.status(500).send("Database error");
        }

        const pendingSql = `
          SELECT COUNT(*) AS pendingOrders
          FROM orders
          WHERE status = 'Pending'
        `;

        conn.query(pendingSql, function (pendingError, pendingResult) {
          if (pendingError) {
            console.log("Pending orders error:", pendingError);
            return res.status(500).send("Database error");
          }

          res.render("admin", {
            products: products,
            totalProducts: products.length,
            totalOrders: orderResult[0].totalOrders,
            totalCustomers: customerResult[0].totalCustomers,
            pendingOrders: pendingResult[0].pendingOrders,
            message: req.session.adminMessage || null,
            messageType: req.session.adminMessageType || null,
          });

          req.session.adminMessage = null;
          req.session.adminMessageType = null;
        });
      });
    });
  });
});

// ADMIN ORDERS

app.get("/admin/orders", requireAdmin, function (req, res) {
  const statusFilter = req.query.status;

  const allowedStatuses = ["Pending", "Processing", "Shipped", "Delivered"];

  let sql = `
    SELECT
      orders.id,
      orders.total_amount,
      orders.status,
      orders.order_date,
      users.username,
      users.email
    FROM orders
    JOIN users
      ON orders.user_id = users.id
  `;

  const values = [];

  if (statusFilter && allowedStatuses.includes(statusFilter)) {
    sql += `
      WHERE orders.status = ?
    `;

    values.push(statusFilter);
  }

  sql += `
    ORDER BY orders.order_date DESC
  `;

  conn.query(sql, values, function (err, orders) {
    if (err) {
      console.log("Admin orders error:", err);
      return res.status(500).send("Database error");
    }

    res.render("admin-orders", {
      orders: orders,
      message: req.session.orderMessage || null,
      statusFilter: statusFilter || "All",
    });

    req.session.orderMessage = null;
  });
});

app.get("/admin/orders", requireAdmin, function (req, res) {
  const statusFilter = req.query.status;

  const allowedStatuses = ["Pending", "Processing", "Shipped", "Delivered"];

  let sql = `
    SELECT
      orders.id,
      orders.total_amount,
      orders.status,
      orders.order_date,
      users.username,
      users.email

    FROM orders

    JOIN users
      ON orders.user_id = users.id
  `;

  const values = [];

  if (statusFilter && allowedStatuses.includes(statusFilter)) {
    sql += `
      WHERE orders.status = ?
    `;

    values.push(statusFilter);
  }

  sql += `
    ORDER BY orders.order_date DESC
  `;

  conn.query(sql, values, function (err, orders) {
    if (err) {
      console.log("Admin orders error:", err);
      return res.status(500).send("Database error");
    }

    res.render("admin-orders", {
      orders: orders,
      message: req.session.orderMessage || null,
      statusFilter: statusFilter || "All",
    });

    req.session.orderMessage = null;
  });
});

// ADMIN - ORDER UPDATE PAGE

app.post("/admin/orders/status/:id", requireAdmin, function (req, res) {
  const orderId = req.params.id;
  const status = req.body.status;

  const allowedStatuses = ["Pending", "Processing", "Shipped", "Delivered"];

  if (!allowedStatuses.includes(status)) {
    req.session.orderMessage = "Invalid order status.";

    return res.redirect("/admin/orders");
  }

  const sql = `
      UPDATE orders
      SET status = ?
      WHERE id = ?
    `;

  conn.query(sql, [status, orderId], function (err, result) {
    if (err) {
      console.log("Order status update error:", err);
      return res.status(500).send("Database error");
    }

    if (result.affectedRows === 0) {
      req.session.orderMessage = "Order not found.";

      return res.redirect("/admin/orders");
    }

    req.session.orderMessage =
      "Order #" + orderId + " updated to " + status + ".";

    console.log("Order status updated:", orderId, status);

    return res.redirect("/admin/orders");
  });
});

// ADMIN VIEW ALL OREDERS

app.get("/admin/orders", requireAdmin, function (req, res) {
  const sql = `
    SELECT
      orders.id,
      orders.total_amount,
      orders.status,
      orders.order_date,
      users.username,
      users.email

    FROM orders

    JOIN users
      ON orders.user_id = users.id

    ORDER BY orders.order_date DESC
  `;

  conn.query(sql, function (err, orders) {
    if (err) {
      console.log("Admin orders error:", err);
      return res.status(500).send("Database error");
    }

    res.render("admin-orders", {
      orders: orders,
      message: req.session.orderMessage || null,
    });

    req.session.orderMessage = null;
  });
});

//ADMIN ADD PRDUCT PAGE

app.get("/admin/products/add", requireAdmin, function (req, res) {
  res.render("admin-add-product");
});

// ADMIN ADD PRODUCT

app.post("/admin/products/add", requireAdmin, function (req, res) {
  const name = req.body.name;
  const brand = req.body.brand;
  const model = req.body.model;
  const price = req.body.price;
  const stock = req.body.stock;
  const categoryId = req.body.category_id;
  const image = req.body.image;
  const ram = req.body.ram;
  const storage = req.body.storage;
  const processor = req.body.processor;
  const os = req.body.os;
  const description = req.body.description;

  const sql = `
    INSERT INTO products
    (
      category_id,
      name,
      brand,
      model,
      price,
      stock,
      image,
      ram,
      storage,
      processor,
      os,
      description
    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  conn.query(
    sql,
    [
      categoryId,
      name,
      brand,
      model,
      price,
      stock,
      image,
      ram,
      storage,
      processor,
      os,
      description,
    ],
    function (err, result) {
      if (err) {
        console.log("Add product error:", err);
        return res.status(500).send("Could not add product");
      }

      console.log("New product added:", result.insertId);

      return res.redirect("/admin");
    },
  );
});

// ADMIN - EDIT PRODUCT PAGE

app.get("/admin/products/edit/:id", requireAdmin, function (req, res) {
  const productId = req.params.id;

  const sql = `
      SELECT *
      FROM products
      WHERE id = ?
    `;

  conn.query(sql, [productId], function (err, results) {
    if (err) {
      console.log("Edit product lookup error:", err);
      return res.status(500).send("Database error");
    }

    if (results.length === 0) {
      return res.status(404).send("Product not found");
    }

    res.render("admin-edit-product", {
      product: results[0],
    });
  });
});

// ADMIN - UPDATE PRODUCT

app.post("/admin/products/edit/:id", requireAdmin, function (req, res) {
  const productId = req.params.id;

  const name = req.body.name;
  const brand = req.body.brand;
  const model = req.body.model;
  const price = req.body.price;
  const stock = req.body.stock;
  const categoryId = req.body.category_id;
  const image = req.body.image;
  const ram = req.body.ram;
  const storage = req.body.storage;
  const processor = req.body.processor;
  const os = req.body.os;
  const description = req.body.description;

  const sql = `
      UPDATE products

      SET
        category_id = ?,
        name = ?,
        brand = ?,
        model = ?,
        price = ?,
        stock = ?,
        image = ?,
        ram = ?,
        storage = ?,
        processor = ?,
        os = ?,
        description = ?

      WHERE id = ?
    `;

  conn.query(
    sql,
    [
      categoryId,
      name,
      brand,
      model,
      price,
      stock,
      image,
      ram,
      storage,
      processor,
      os,
      description,
      productId,
    ],
    function (err, result) {
      if (err) {
        console.log("Update product error:", err);

        return res.status(500).send("Could not update product");
      }

      if (result.affectedRows === 0) {
        return res.status(404).send("Product not found");
      }

      console.log("Product updated:", productId);

      return res.redirect("/admin");
    },
  );
});

// ADMIN - SAFE DELETE PRODUCT

app.post("/admin/products/delete/:id", requireAdmin, function (req, res) {
  const productId = req.params.id;

  const checkSql = `
      SELECT

        (
          SELECT COUNT(*)
          FROM order_items
          WHERE product_id = ?
        ) AS orderCount,

        (
          SELECT COUNT(*)
          FROM cart
          WHERE product_id = ?
        ) AS cartCount,

        (
          SELECT COUNT(*)
          FROM wishlist
          WHERE product_id = ?
        ) AS wishlistCount
    `;

  conn.query(
    checkSql,
    [productId, productId, productId],
    function (checkError, results) {
      if (checkError) {
        console.log("Product delete check error:", checkError);

        return res.status(500).send("Database error");
      }

      const references = results[0];

      const orderCount = Number(references.orderCount);

      const cartCount = Number(references.cartCount);

      const wishlistCount = Number(references.wishlistCount);

      // Product has related records
      if (orderCount > 0 || cartCount > 0 || wishlistCount > 0) {
        console.log(
          "Cannot delete product:",
          productId,
          "Orders:",
          orderCount,
          "Cart:",
          cartCount,
          "Wishlist:",
          wishlistCount,
        );

        req.session.adminMessage =
          "Cannot delete this product because it has existing records. " +
          "Orders: " +
          orderCount +
          ", Cart: " +
          cartCount +
          ", Wishlist: " +
          wishlistCount +
          ". Set its stock to 0 if you no longer want to sell it.";

        req.session.adminMessageType = "error";

        return res.redirect("/admin");
      }

      // Safe to delete
      const deleteSql = `
          DELETE FROM products
          WHERE id = ?
        `;

      conn.query(deleteSql, [productId], function (deleteError, result) {
        if (deleteError) {
          console.log("Delete product error:", deleteError);

          return res.status(500).send("Could not delete product");
        }

        if (result.affectedRows === 0) {
          return res.status(404).send("Product not found");
        }

        console.log("Product deleted:", productId);

        req.session.adminMessage = "Product deleted successfully.";

        req.session.adminMessageType = "success";

        return res.redirect("/admin");
      });
    },
  );
});

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

// WISHLIST

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

// VIEW CART

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

// ADD PRODUCT TO CART

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

// Increase cart quantity with stock check

app.post("/cart/increase/:id", requireLogin, function (req, res) {
  const userId = req.session.userId;
  const productId = req.params.id;

  // Get current cart quantity and available product stock
  const checkSql = `
    SELECT
      cart.quantity,
      products.stock,
      products.name
    FROM cart
    JOIN products
      ON cart.product_id = products.id
    WHERE cart.user_id = ?
    AND cart.product_id = ?
  `;

  conn.query(checkSql, [userId, productId], function (checkError, result) {
    if (checkError) {
      console.log("Cart stock check error:", checkError);
      return res.status(500).send("Database error");
    }

    if (result.length === 0) {
      return res.redirect("/cart");
    }

    const currentQuantity = Number(result[0].quantity);
    const availableStock = Number(result[0].stock);

    // Do not allow quantity to exceed stock
    if (currentQuantity >= availableStock) {
      console.log(
        "Cannot increase quantity. Stock limit reached:",
        result[0].name,
      );

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
        console.log("Increase cart error:", updateError);
        return res.status(500).send("Database error");
      }

      console.log("Cart quantity increased:", productId);

      return res.redirect("/cart");
    });
  });
});

// DECREASE CART QUANTITY

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

// REMOVE PRODUCT FROM CART

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

      req.session.role = user.role;

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

// GET ALL ORDERS FOR LOGGED-IN USER

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

// PLACE ORDER

app.post("/api/orders", requireLogin, function (req, res) {
  const userId = req.session.userId;

  // Start transaction
  conn.beginTransaction(function (transactionError) {
    if (transactionError) {
      console.log("Transaction start error:", transactionError);

      return res.status(500).json({
        success: false,
        message: "Could not start order transaction",
      });
    }

    // 1. GET CART ITEMS WITH PRODUCT DETAILS AND LOCK THEM FOR UPDATE

    const cartSql = `
      SELECT
        cart.product_id,
        cart.quantity,
        products.name,
        products.price,
        products.stock
      FROM cart
      JOIN products
        ON cart.product_id = products.id
      WHERE cart.user_id = ?
      FOR UPDATE
    `;

    conn.query(cartSql, [userId], function (cartError, cartItems) {
      if (cartError) {
        console.log("Order cart error:", cartError);

        return conn.rollback(function () {
          return res.status(500).json({
            success: false,
            message: "Database error",
          });
        });
      }

      // 2. PREVENT ORDER IF CART IS EMPTY

      if (cartItems.length === 0) {
        return conn.rollback(function () {
          return res.status(400).json({
            success: false,
            message: "Your cart is empty",
          });
        });
      }

      // 3. CHECK STOCK AVAILABILITY FOR EACH ITEM

      const insufficientStockItem = cartItems.find(function (item) {
        return Number(item.quantity) > Number(item.stock);
      });

      if (insufficientStockItem) {
        return conn.rollback(function () {
          return res.status(400).json({
            success: false,
            message:
              "Not enough stock for " +
              insufficientStockItem.name +
              ". Available stock: " +
              insufficientStockItem.stock,
          });
        });
      }

      // 4. CALCULATE TOTAL AMOUNT

      let totalAmount = 0;

      cartItems.forEach(function (item) {
        totalAmount += Number(item.price) * Number(item.quantity);
      });

      // 5. CREATE ORDER RECORD

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

            return conn.rollback(function () {
              return res.status(500).json({
                success: false,
                message: "Could not create order",
              });
            });
          }

          const orderId = orderResult.insertId;

          console.log("Order created:", orderId);

          // 6. PREPARE ORDER ITEMS DATA

          const orderItems = cartItems.map(function (item) {
            return [orderId, item.product_id, item.quantity, item.price];
          });

          // 7. SAVE ORDER ITEMS

          const orderItemsSql = `
            INSERT INTO order_items
              (order_id, product_id, quantity, price)
            VALUES ?
          `;

          conn.query(orderItemsSql, [orderItems], function (itemsError) {
            if (itemsError) {
              console.log("Order items error:", itemsError);

              return conn.rollback(function () {
                return res.status(500).json({
                  success: false,
                  message: "Could not save order items",
                });
              });
            }

            console.log("Order items saved");

            // 8. REDUCE STOCK FOR EACH PRODUCT

            let completedUpdates = 0;
            let stockFailed = false;

            cartItems.forEach(function (item) {
              const updateStockSql = `
                  UPDATE products
                  SET stock = stock - ?
                  WHERE id = ?
                  AND stock >= ?
                `;

              conn.query(
                updateStockSql,
                [item.quantity, item.product_id, item.quantity],
                function (stockError, stockResult) {
                  if (stockFailed) {
                    return;
                  }

                  if (stockError || stockResult.affectedRows === 0) {
                    stockFailed = true;

                    console.log("Stock update failed:", stockError);

                    return conn.rollback(function () {
                      return res.status(400).json({
                        success: false,
                        message: "Could not update product stock",
                      });
                    });
                  }

                  completedUpdates++;

                  // Continue only after all stock updates

                  if (completedUpdates === cartItems.length) {
                    // 9. CLEAR USER'S CART

                    const clearCartSql = `
                        DELETE FROM cart
                        WHERE user_id = ?
                      `;

                    conn.query(clearCartSql, [userId], function (clearError) {
                      if (clearError) {
                        console.log("Clear cart error:", clearError);

                        return conn.rollback(function () {
                          return res.status(500).json({
                            success: false,
                            message: "Could not clear cart",
                          });
                        });
                      }

                      // 10.COMMIT TRANSACTION

                      conn.commit(function (commitError) {
                        if (commitError) {
                          console.log("Commit error:", commitError);

                          return conn.rollback(function () {
                            return res.status(500).json({
                              success: false,
                              message: "Order could not be completed",
                            });
                          });
                        }

                        console.log("Order transaction completed:", orderId);

                        return res.json({
                          success: true,
                          message: "Order placed successfully",
                          orderId: orderId,
                        });
                      });
                    });
                  }
                },
              );
            });
          });
        },
      );
    });
  });
});

// DATABASE CHECKOUT PAGE

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

// PROFILE PAGE

app.get("/profile", requireLogin, function (req, res) {
  const userId = req.session.userId;

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

    res.render("profile", {
      user: results[0],

      message: req.session.profileMessage || null,
    });

    // Remove message after showing it once
    req.session.profileMessage = null;
  });
});

// UODATE PROFILE

app.post("/profile/update", requireLogin, function (req, res) {
  const userId = req.session.userId;

  const username = req.body.username.trim();
  const email = req.body.email.trim();
  const contact = req.body.contact.trim();

  // Basic validation
  if (!username || !email || !contact) {
    req.session.profileMessage = "Please complete all profile fields.";

    return res.redirect("/profile");
  }

  // Check if another user already has this email
  const checkEmailSql = `
    SELECT id
    FROM users
    WHERE email = ?
    AND id != ?
  `;

  conn.query(
    checkEmailSql,
    [email, userId],
    function (checkError, emailResults) {
      if (checkError) {
        console.log("Profile email check error:", checkError);

        return res.status(500).send("Database error");
      }

      if (emailResults.length > 0) {
        req.session.profileMessage =
          "That email address is already being used.";

        return res.redirect("/profile");
      }

      const updateSql = `
        UPDATE users
        SET
          username = ?,
          email = ?,
          contact = ?
        WHERE id = ?
      `;

      conn.query(
        updateSql,
        [username, email, contact, userId],
        function (updateError) {
          if (updateError) {
            console.log("Profile update error:", updateError);

            return res.status(500).send("Could not update profile");
          }

          // Update session values
          req.session.username = username;
          req.session.email = email;

          req.session.profileMessage = "Profile updated successfully.";

          console.log("Profile updated for user:", userId);

          return res.redirect("/profile");
        },
      );
    },
  );
});

// CHANGE PASSWORD

app.post("/profile/change-password", requireLogin, async function (req, res) {
  const userId = req.session.userId;

  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;

  if (!currentPassword || !newPassword || !confirmPassword) {
    req.session.profileMessage = "Please complete all password fields.";

    return res.redirect("/profile");
  }

  if (newPassword.length < 8) {
    req.session.profileMessage = "New password must be at least 8 characters.";

    return res.redirect("/profile");
  }

  if (newPassword !== confirmPassword) {
    req.session.profileMessage = "New passwords do not match.";

    return res.redirect("/profile");
  }

  const userSql = `
      SELECT password
      FROM users
      WHERE id = ?
    `;

  conn.query(userSql, [userId], async function (userError, results) {
    if (userError) {
      console.log("Password lookup error:", userError);

      return res.status(500).send("Database error");
    }

    if (results.length === 0) {
      return res.status(404).send("User not found");
    }

    try {
      const storedPassword = results[0].password;

      const passwordMatch = await bcrypt.compare(
        currentPassword,
        storedPassword,
      );

      if (!passwordMatch) {
        req.session.profileMessage = "Current password is incorrect.";

        return res.redirect("/profile");
      }

      const samePassword = await bcrypt.compare(newPassword, storedPassword);

      if (samePassword) {
        req.session.profileMessage =
          "New password must be different from your current password.";

        return res.redirect("/profile");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updateSql = `
            UPDATE users
            SET password = ?
            WHERE id = ?
          `;

      conn.query(updateSql, [hashedPassword, userId], function (updateError) {
        if (updateError) {
          console.log("Password update error:", updateError);

          return res.status(500).send("Could not update password");
        }

        req.session.profileMessage = "Password changed successfully.";

        console.log("Password updated for user:", userId);

        return res.redirect("/profile");
      });
    } catch (passwordError) {
      console.log("Password change error:", passwordError);

      return res.status(500).send("Could not change password");
    }
  });
});

// Start server

app.listen(3000, function () {
  console.log("Server is running on http://localhost:3000");
});
