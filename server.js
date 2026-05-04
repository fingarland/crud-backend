const express = require('express');
const mysql = require('mysql2');

const app = express();

// 🔥 SOPORTAR FORM-DATA (clave para Volley)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔥 POOL
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10
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
// 🔥 CREAR (SIMPLE Y CORRECTO)
// =======================
app.post('/create', (req, res) => {

  console.log("👉 BODY:", req.body);

  const nombre = req.body.nombre;
  const edad = req.body.edad;
  const programa = req.body.programa;

  if (!nombre || !edad || !programa) {
    return res.status(400).json({
      error: "Datos incompletos",
      body: req.body
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
        message: "Guardado",
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

  const id = req.body.id;

  if (!id) {
    return res.status(400).json({ error: "ID requerido" });
  }

  db.query('DELETE FROM estudiantes WHERE id=?', [id], (err) => {
    if (err) {
      console.log("❌ ERROR DELETE:", err);
      return res.status(500).json(err);
    }

    res.json({ message: "Eliminado" });
  });
});

// =======================
// 🔥 SERVER
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});