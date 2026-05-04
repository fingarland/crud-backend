const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE
});

app.post('/create', (req, res) => {
  const { nombre, edad, programa } = req.body;
  db.query(
    'INSERT INTO estudiantes (nombre, edad, programa) VALUES (?, ?, ?)',
    [nombre, edad, programa],
    (err) => {
      if (err) return res.send(err);
      res.send('OK');
    }
  );
});

app.get('/read', (req, res) => {
  db.query('SELECT * FROM estudiantes', (err, results) => {
    if (err) return res.send(err);
    res.json(results);
  });
});

app.post('/delete', (req, res) => {
  const { id } = req.body;
  db.query('DELETE FROM estudiantes WHERE id=?', [id], (err) => {
    if (err) return res.send(err);
    res.send('OK');
  });
});

app.listen(process.env.PORT || 3000);