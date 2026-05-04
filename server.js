const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

// 🔥 USAR POOL (MEJOR PARA RAILWAY)
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT, // 🔥 IMPORTANTE
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 👉 PROBAR CONEXIÓN
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error conexión DB:", err);
  } else {
    console.log("✅ Conectado a MySQL");
    connection.release();
  }
});

// CREAR
app.post('/create', (req, res) => {
  const { nombre, edad, programa } = req.body;

  db.query(
    'INSERT INTO estudiantes (nombre, edad, programa) VALUES (?, ?, ?)',
    [nombre, edad, programa],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send('OK');
    }
  );
});

// LISTAR
app.get('/read', (req, res) => {
  db.query('SELECT * FROM estudiantes', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// ELIMINAR
app.post('/delete', (req, res) => {
  const { id } = req.body;

  db.query('DELETE FROM estudiantes WHERE id=?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('OK');
  });
});

// SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});