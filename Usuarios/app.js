const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8002;
const app = express();
const { v4: uuidv4 } = require('uuid');

app.use(bodyParser.json());

const date = new Date();


// MySql
const connection = mysql.createConnection({
  host: 'dbRadio',
  user: 'dbuser',
  password: 'dbuser',
  database: 'vinculacion',
});


app.get('/', (req, res) => {
  res.send('Welcome to my API!');
});

app.get('/find/users', (req, res) => {
  try {
    const sql = 'SELECT * FROM usuarios';
    connection.query(sql, (error, results) => {
      if (error) return res.status(400).send(error);
      if (results.length > 0) {
        return res.json(results);
      } else {
        return res.send('Not result');
      }
    });
    
  } catch (error) {
    return res.status(400).send(error);
  }
});

app.get('/findById/:id', (req, res) => {
  try {
      const { id } = req.params;
      const sql = `SELECT * FROM usuarios WHERE id = ${id}`;
      connection.query(sql, (error, result) => {
        if (error) return res.status(400).send(error);
    
        if (result.length > 0) {
          res.json(result);
        } else {
          res.send('Not result');
        }
      });
  } catch (error) {
      return res.status(400).send(error);
  }
});

app.post('/create/users', (req, res) => {
  try {
    const sql = 'INSERT INTO usuarios SET ?';

    const customerObj = {
      username: req.body.username || "",
      name_user: req.body.name_user || "",
      email: req.body.email || "",
      rol: req.body.rol || "",
      area: req.body.area || "",
      password: req.body.password || "",
      created_At: date || "",
      updated_At: req.body.updated_At || "",
      deleted_At: req.body.deleted_At || "",

    };

    connection.query(sql, customerObj, error => {
      if (error) return res.status(400).send(error);
      res.send('User created!');
    });
  } catch (error) {
    return res.status(400).send(error);
  }
  
});

app.delete('/delete/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const sql = `DELETE FROM usuarios WHERE id= ${id}`;
  
    connection.query(sql, error => {
      if (error) return res.status(400).send(error);
      res.send('Delete user');
    });
  } catch (error) {
    return res.status(400).send(error);
  }
});


// app.put('/update/users/:id', (req, res) => {
//   const { id } = req.params;
//   const { name, city } = req.body;
//   const sql = `UPDATE customers SET name = '${name}', city='${city}' WHERE id =${id}`;

//   connection.query(sql, error => {
//     if (error) throw error;
//     res.send('Customer updated!');
//   });
// });


connection.connect(error => {
  if (error) return res.status(400).send(error);
  console.log('Database server running!');
});


app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));