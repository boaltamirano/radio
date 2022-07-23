const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8005;
const app = express();

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

app.get('/find/equipment', (req, res) => {
  try {
    const sql = 'SELECT * FROM equipos';
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
      const sql = `SELECT * FROM equipos WHERE id = ${id}`;
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

app.post('/create/equipment', (req, res) => {
  try {
    const sql = 'INSERT INTO equipos SET ?';

    const customerObj = {
      name_maintenance: req.body.name_maintenance || "",
      activity: req.body.activity || "",
      parts: req.body.parts || "",
      frequency: req.body.frequency || "",
      priority: req.body.priority || "",
      responsible: req.body.responsible || "",
      procedure_maintenance: req.body.procedure_maintenance || "",
      days_stop: req.body.days_stop || "",
      description_maintenance: req.body.description_maintenance || "",
      id_Equipo: req.body.id_Equipo || "",
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

app.delete('/delete/equipment/:id', (req, res) => {
  try {
    const { id } = req.params;
    const sql = `DELETE FROM equipos WHERE id= ${id}`;
  
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
  if (error) throw error;
  console.log('Database server running!');
});


app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));