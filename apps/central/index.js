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
// DB CONNECTION
const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  database: process.env.PGDATABASE || "central_db",
  port: process.env.PGPORT || 5432,
});

// TABLE EXISTS CHECK
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      jmbg VARCHAR(13) PRIMARY KEY,
      ime VARCHAR(50),
      prezime VARCHAR(50),
      adresa VARCHAR(100)
    );

    CREATE TABLE IF NOT EXISTS rentals (
      id SERIAL PRIMARY KEY,
      jmbg VARCHAR(13) REFERENCES users(jmbg),
      bike_label VARCHAR(50),
      bike_type VARCHAR(50),
      rented_at TIMESTAMP DEFAULT now(),
      returned_at TIMESTAMP
    );
  `);
})();

// REGISTER
app.post("/register", async (req, res) => {
  const { ime, prezime, adresa, jmbg } = req.body;
  try {
    const exists = await pool.query("SELECT 1 FROM users WHERE jmbg = $1", [jmbg]);
    if (exists.rowCount > 0) {
      return res.status(400).json({ success: false, message: "Korisnik već postoji" });
    }
    await pool.query(
      "INSERT INTO users (jmbg, ime, prezime, adresa) VALUES ($1, $2, $3, $4)",
      [jmbg, ime, prezime, adresa]
    );
    res.json({ success: true, message: "Uspešna registracija" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Greška servera" });
  }
});

// RENT LIMIT CHECK
app.get("/can-rent/:jmbg", async (req, res) => {
  const { jmbg } = req.params;
  try {
    const active = await pool.query(
      "SELECT COUNT(*) FROM rentals WHERE jmbg = $1 AND returned_at IS NULL",
      [jmbg]
    );
    const count = parseInt(active.rows[0].count, 10);
    if (count >= 2) {
      return res.json({ allowed: false, message: "Limit 2 bicikla već dostignut" });
    }
    res.json({ allowed: true, message: "Korisnik može da zaduži bicikl" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška servera" });
  }
});

// RENT
app.post("/rent", async (req, res) => {
  const { jmbg, bike_label, bike_type } = req.body;
  try {
    const active = await pool.query(
      "SELECT COUNT(*) FROM rentals WHERE jmbg = $1 AND returned_at IS NULL",
      [jmbg]
    );
    if (parseInt(active.rows[0].count, 10) >= 2) {
      return res.status(400).json({ success: false, message: "Limit već dostignut" });
    }

    await pool.query(
      "INSERT INTO rentals (jmbg, bike_label, bike_type) VALUES ($1, $2, $3)",
      [jmbg, bike_label, bike_type]
    );
    res.json({ success: true, message: "Zaduživanje registrovano" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Greška servera" });
  }
});

// RETURN BIKE
app.post("/return", async (req, res) => {
  const { jmbg, bike_label } = req.body;
  try {
    await pool.query(
      "UPDATE rentals SET returned_at = now() WHERE jmbg = $1 AND bike_label = $2 AND returned_at IS NULL",
      [jmbg, bike_label]
    );
    res.json({ success: true, message: "Razduživanje registrovano" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Greška servera" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Central pokrenut na portu ${PORT}`));
