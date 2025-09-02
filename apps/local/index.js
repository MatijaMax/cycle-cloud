const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");



const app = express();
  app.use(cors({
    origin: true, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
app.use(bodyParser.json());

const CENTRAL_URL = "http://central:3000";

// LOCAL DB
const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  database: process.env.PGDATABASE || "local_db",
  port: process.env.PGPORT || 5432,
});

// TABLE EXISTS CHECK
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS city_rentals (
      id SERIAL PRIMARY KEY,
      jmbg VARCHAR(13),
      bike_label VARCHAR(50),
      bike_type VARCHAR(50),
      rented_at TIMESTAMP DEFAULT now(),
      returned_at TIMESTAMP
    );
  `);
})();

// RENT
app.post("/rent", async (req, res) => {
  const { jmbg, bike_label, bike_type } = req.body;
  try {
    // IS ALLOWED CHECK
    const check = await fetch(`${CENTRAL_URL}/can-rent/${jmbg}`);
    const checkData = await check.json();
    if (!check.ok || !checkData.allowed) {
      return res.status(400).json({ success: false, message: checkData.message });
    }

    // REGISTER CENTRAL
    const centralResp = await fetch(`${CENTRAL_URL}/rent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jmbg, bike_label, bike_type }),
    });
    const centralData = await centralResp.json();
    if (!centralResp.ok || !centralData.success) {
      return res.status(400).json(centralData);
    }

    // SAVE
    await pool.query(
      "INSERT INTO city_rentals (jmbg, bike_label, bike_type) VALUES ($1, $2, $3)",
      [jmbg, bike_label, bike_type]
    );

    res.json({ success: true, message: `Bicikl zadužen` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška servera" });
  }
});

// RETURN BIKE
app.post("/return", async (req, res) => {
  const { jmbg, bike_label } = req.body;
  try {
    // UPDATE CENTRAL
    await fetch(`${CENTRAL_URL}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jmbg, bike_label }),
    });

    // UPDATE LOCAL
    await pool.query(
      "UPDATE city_rentals SET returned_at = now() WHERE jmbg = $1 AND bike_label = $2 AND returned_at IS NULL",
      [jmbg, bike_label]
    );

    res.json({ success: true, message: `Bicikl vraćen` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška servera" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`Servis pokrenut`));
