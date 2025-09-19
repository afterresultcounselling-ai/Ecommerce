import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { customer_name, customer_email, items } = req.body;

    try {
      // 1. Calculate total
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

      // 2. Insert into orders
      const order = await pool.query(
        "INSERT INTO orders (customer_name, customer_email, total_amount) VALUES ($1, $2, $3) RETURNING id",
        [customer_name, customer_email, total]
      );

      const orderId = order.rows[0].id;

      // 3. Insert order items
      for (let i of items) {
        await pool.query(
          "INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)",
          [orderId, i.id, i.quantity]
        );
      }

      res.status(200).json({ success: true, orderId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create order" });
    }
  } else {
    res.status(405).end();
  }
}
