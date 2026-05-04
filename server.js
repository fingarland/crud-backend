const express = require('express');
const mysql = require('mysql2');

const app = express();

// 🔥 SOPORTAR JSON + FORM DATA
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 🔥 POOL
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 🔥 TEST
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error conexión DB:", err);
  } else {
    console.log("✅ Conectado a MySQL");
    connection.release();
  }
});

// =======================
// 🔥 CREAR (FIX TOTAL)
// =======================
app.post('/create', (req, res) => {

  console.log("👉 RAW BODY:", req.body);

  let nombre, edad, programa;

  // 🔥 CASO 1: JSON correcto
  if (req.body && typeof req.body === "object") {
    nombre = req.body.nombre;
    edad = req.body.edad;
    programa = req.body.programa;
  }

  // 🔥 CASO 2: JSON como string (error común de Volley)
  if (!nombre && typeof req.body === "string") {
    try {
      const data = JSON.parse(req.body);
      nombre = data.nombre;
      edad = data.edad;
      programa = data.programa;
    } catch (e) {
      console.log("❌ Error parse JSON:", e);
    }
  }

  // 🔥 VALIDACIÓN FUERTE
  if (!nombre || !edad || !programa) {
    return res.status(400).json({
      error: "Datos incompletos",
      recibido: req.body
    });
  }

  db.query(
    'INSERT INTO estudiantes (nombre, edad, programa) VALUES (?, ?, ?)',
    [nombre, edad, programa],
    (err, result) => {
      if (err) {
        console.log("❌ SQL ERROR:", err);
        return res.status(500).json(err);
      }

      res.json({
        message: "OK",
        id: result.insertId
      });
    }
  );
});

// =======================
// 🔥 LISTAR
// =======================
app.get('/read', (req, res) => {
  db.query('SELECT * FROM estudiantes', (err, results) => {
    if (err) {
      console.log("❌ ERROR READ:", err);
      return res.status(500).json(err);
    }

    res.json(results);
  });
});

// =======================
// 🔥 ELIMINAR
// =======================
app.post('/delete', (req, res) => {

  console.log("👉 DELETE BODY:", req.body);

  let id = req.body.id;

  // 🔥 FIX si viene como string JSON
  if (!id && typeof req.body === "string") {
    try {
      const data = JSON.parse(req.body);
      id = data.id;
    } catch (e) {}
  }

  if (!id) {
    return res.status(400).json({ error: "ID requerido" });
  }

  db.query('DELETE FROM estudiantes WHERE id=?', [id], (err) => {
    if (err) {
      console.log("❌ ERROR DELETE:", err);
      return res.status(500).json(err);
    }

    res.json({ message: "OK" });
  });
});

// =======================
// 🔥 SERVER
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});