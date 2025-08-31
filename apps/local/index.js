const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// City name from env
const CITY_NAME = process.env.CITY_NAME || "DefaultCity";
const CENTRAL_URL = process.env.CENTRAL_URL || "http://central:3000";

// Local DB
const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  database: process.env.PGDATABASE || "local_db",
  port: process.env.PGPORT || 5432,
});

// ensure local table exists
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

// ✅ Register user (delegates to central)
app.post("/register", async (req, res) => {
  try {
    const response = await fetch(`${CENTRAL_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška komunikacije sa centralom" });
  }
});

// ✅ Rent a bike
app.post("/rent", async (req, res) => {
  const { jmbg, bike_label, bike_type } = req.body;
  try {
    // ask central if allowed
    const check = await fetch(`${CENTRAL_URL}/can-rent/${jmbg}`);
    const checkData = await check.json();
    if (!checkData.allowed) {
      return res.status(400).json({ success: false, message: checkData.message });
    }

    // register in central
    const centralResp = await fetch(`${CENTRAL_URL}/rent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jmbg, bike_label, bike_type }),
    });
    const centralData = await centralResp.json();
    if (!centralData.success) {
      return res.status(400).json(centralData);
    }

    // save locally
    await pool.query(
      "INSERT INTO city_rentals (jmbg, bike_label, bike_type) VALUES ($1, $2, $3)",
      [jmbg, bike_label, bike_type]
    );

    res.json({ success: true, message: `Bicikl zadužen u ${CITY_NAME}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška servera" });
  }
});

// ✅ Return bike
app.post("/return", async (req, res) => {
  const { jmbg, bike_label } = req.body;
  try {
    // update central
    await fetch(`${CENTRAL_URL}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jmbg, bike_label }),
    });

    // update local
    await pool.query(
      "UPDATE city_rentals SET returned_at = now() WHERE jmbg = $1 AND bike_label = $2 AND returned_at IS NULL",
      [jmbg, bike_label]
    );

    res.json({ success: true, message: `Bicikl vraćen u ${CITY_NAME}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška servera" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Local service ${CITY_NAME} running on port ${PORT}`));
