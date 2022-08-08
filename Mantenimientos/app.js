const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const { header, check } = require("express-validator");
const PORT = process.env.PORT || 8005;
const app = express();

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
const { validarCampos } = "./middlewares/validateFields.js";

// variables globales
const date = new Date();

//rutas
app.get("/", (req, res) => {
	res.status(200).json({ mensaje: "Welcome to my API!  --Mantenimiento" });
});

app.get("/find/maintenance", (req, res) => {
	try {
		const sql = "SELECT * FROM equipos";
		connection.query(sql, (error, results) => {
			if (error) return res.status(400).send(error);
			if (results.length > 0) {
				return res.json(results);
			} else {
				return res.send("Not result");
			}
		});
	} catch (error) {
		return res.status(400).send(error);
	}
});

app.get("/findByIdMaintenance/:id", (req, res) => {
	try {
		const { id } = req.params;
		const sql = `SELECT * FROM equipos WHERE id = ${id}`;
		connection.query(sql, (error, result) => {
			if (error) return res.status(400).send(error);

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

//TODO: Get para mantenimientos eliminados
//? El mantenimiento lo voy a tener o no borrado
//!Es necesario crear el campo de state_maintenance

app.post(
	"/create/maintenance",
	[
		//verifico si es administrador
		header("rol", "El Usuario no tiene permisos para realizar esto.").isIn([
			"ADMINISTRADOR",
		]),
		//control de nombre mantenimiento
		check(
			"name_maintenance",
			"El nombre del mantenimiento es olbigatorio. --name_maintenance"
		)
			.not()
			.isEmpty(),
		//control de actividad
		check("activity", "La actividad es obligatoria.  --activity").not().isEmpty(),
		//control de partes
		check("parts", "No es una parte válida.").isIn([
			"TECLADOS",
			"MONITORES",
			"PARLANTES",
			"MOUSE",
			"CONSOLAS",
			"MICROFONOS",
			"CPU",
			"SERVIDORES",
			"IMPRESORAS",
		]),
		//control de frecuencia
		check("frequency", "La frecuencia es obligatoria.")
			.not()
			.isEmpty()
			.isInt({ min: 1, max: 12 }),
		//control de prioridad
		check("priority", "La prioridod es incorrecta verifique nuevamente.").isIn([
			"ALTA",
			"MEDIA",
			"BAJA",
		]),
		//!control de responsable falta
		check("responsible", "El responsable es necesario.").not().isEmpty(),
		//control área
		check("component_area", "El area ingresada no es valida.").isIn([
			"SECRETARIA",
			"EDICION",
			"GRABACION",
			"MASTER AM",
			"MASTER FM",
		]),
		validarCampos,
	],
	(req, res) => {
		try {
			const sql = "INSERT INTO equipos SET ?";

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

			connection.query(sql, customerObj, (error) => {
				if (error) return res.status(400).send(error);
				res.send("User created!");
			});
		} catch (error) {
			return res.status(400).send(error);
		}
	}
);

app.delete("/delete/maintenance/:id", (req, res) => {
	try {
		const { id } = req.params;
		const sql = `DELETE FROM equipos WHERE id= ${id}`;

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
