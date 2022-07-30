const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const PORT = process.env.PORT || 8004;
const app = express();
const { check, header, param } = require("express-validator");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MySql
//const connection = mysql.createConnection({
//  host: 'dbRadio',
//  user: 'dbuser',
//  password: 'dbuser',
//  database: 'vinculacion',
//});

//trabajo local
const connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "vinculacion",
});

//middlewares

const { validarCampos } = require("./middlewares/validateFields");

//rutas
app.get("/", (req, res) => {
	res.json({ mensaje: "Welcome to my API! --Componentes" });
});

app.get(
	"/find/components",
	[
		// !control de roles el usuario debe ser administrador
		header("rol", "El Usuario no tiene permisos para realizar esto.").isIn([
			"ADMINISTRADOR",
		]),
		// ?mensajes para ver el error
		validarCampos,
	],
	(req, res) => {
		try {
			const sql = "SELECT * FROM componentes";
			connection.query(sql, (error, results) => {
				if (error)
					return res
						.status(400)
						.json({ mensaje: "La búsqueda no se pudo realizar", error });
				if (results.length > 0) {
					return res.status(200).json({ results });
				} else {
					return res.status(200).json({ mensaje: "No se encontraron componentes" });
				}
			});
		} catch (error) {
			return res.status(400).json({ error });
		}
	}
);

app.get("/findById/:id", (req, res) => {
	try {
		const { id } = req.params;
		const sql = `SELECT * FROM componentes WHERE idComponente = ${id}`;
		connection.query(sql, (error, result) => {
			if (error) return res.status(400).send(error.sqlMessage);

			if (result.length > 0) {
				res.json(result);
			} else {
				res.send("Not result");
			}
		});
	} catch (error) {
		return res.status(400).send(error);
	}
});

app.post("/create/components", (req, res) => {
	try {
		const sql = "INSERT INTO componentes SET ?";

		const customerObj = {
			component_name: req.body.name_equipment || "",
			processor: req.body.processor || "",
			component_brand: req.body.component_brand || "",
			component_area: req.body.component_area || "",
			serial_number: req.body.serial_number || "",
			date_purchase: req.body.date_purchase || "",
			year_component: req.body.year_component || "",
			component_priority: req.body.component_priority || "",
			id_Equipo: req.body.id_Equipo || "",
			created_At: date || "",
			updated_At: req.body.updated_At || "",
			deleted_At: req.body.deleted_At || "",
		};

		connection.query(sql, customerObj, (error) => {
			if (error) return res.status(400).send(error);
			res.send("User created!");
		});
	} catch (error) {
		return res.status(400).send(error);
	}
});

app.delete("/delete/components/:id", (req, res) => {
	try {
		const { id } = req.params;
		const sql = `DELETE FROM componentes WHERE id= ${id}`;

		connection.query(sql, (error) => {
			if (error) return res.status(400).send(error);
			res.send("Delete user");
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

connection.connect((error) => {
	if (error) throw error;
	console.log("Database server running!");
});

app.listen(PORT, "0.0.0.0", () =>
	console.log(`Server running on port ${PORT}`)
);
