const express = require('express');
const mysql = require('mysql2');

const app = express();

// 🔥 ACEPTAR JSON Y FORM DATA (IMPORTANTE)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 🔥 POOL DE CONEXIÓN
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

// 🔥 TEST CONEXIÓN
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error conexión DB:", err);
  } else {
    console.log("✅ Conectado a MySQL");
    connection.release();
  }
});

// =======================
// 🔥 CREAR
// =======================
app.post('/create', (req, res) => {

  console.log("👉 BODY RECIBIDO:", req.body); // 🔥 DEBUG CLAVE

  const { nombre, edad, programa } = req.body;

  // 🔥 VALIDACIÓN REAL
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
        console.log("❌ ERROR CREATE:", err);
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

  console.log("👉 DELETE BODY:", req.body); // 🔥 DEBUG

  const { id } = req.body;

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