const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const PORT = process.env.PORT || 8005;
const app = express();
const { header, check } = require("express-validator");

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

// variables globales
const date = new Date();

//rutas
app.get("/", (req, res) => {
	res.status(200).json({ mensaje: "Welcome to my API!  --Mantenimiento" });
});

app.get(
	"/find/maintenance",
	[
		//validar q sea admin
		header("rol", "El usuario no tiene permiso para realizar la acción.").isIn([
			"ADMINISTRADOR",
		]),
		validarCampos,
	],
	(req, res) => {
		try {
			const sql = "SELECT * FROM mantenimientos";
			connection.query(sql, (error, results) => {
				if (error)
					return res
						.status(400)
						.json({ mensaje: "No se puede mostrar los mantenimientos. " + error });
				if (results.length > 0) {
					return res.status(200).json({ results });
				} else {
					return res
						.status(200)
						.json({ mensaje: "No se han encontrado mantenimientos." });
				}
			});
		} catch (error) {
			return res.status(500).json({ error });
		}
	}
);

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
		// control de roles el usuario debe ser administrador
		header("rol", "El Usuario no tiene permisos para realizar esto.").isIn([
			"ADMINISTRADOR",
		]),
		//name_maintenance
		check("name_maintenance", "El nombre del mantenimiento es obligatorio.")
			.not()
			.isEmpty(),
		//activity
		check("activity", "La actividad es obligatoria.").not().isEmpty(),
		//parts
		check("parts", "No es una parte válida.").isIn([
			"TECLADOS",
			"MONITORES",
			"PARLANTES",
			"MOUSE",
			"CONSOLAS",
			"MICRÓFONOS",
			"CPU",
			"SERVIDORES",
			"IMPRESORAS",
		]),
		//frequency
		check("frequency", "La frecuencia debe ir entre 1 y 12.").isInt({
			min: 1,
			max: 12,
		}),
		//priority
		check("priority", "La prioridad es incorrecta.").isIn([
			"ALTA",
			"MEDIA",
			"BAJA",
		]),
		//responsible
		check("responsible", "El responsalbe de la actividad es obligatorio.")
			.not()
			.isEmpty(),
		//procedure_maintenance
		check(
			"procedure_maintenance",
			"El procedimiento para la actividad es necesario."
		)
			.not()
			.isEmpty(),
		//days_stop
		check("days_stop", "No es un día válido").isInt(),
		//description_maintenance
		check("description_maintenance", "La descripción es necesaria.")
			.not()
			.isEmpty(),
		// mensajes para ver el error
		validarCampos,
	],
	(req, res) => {
		try {
			const sql = "INSERT INTO mantenimientos SET ?";

			const customerObj = {
				name_maintenance: req.body.name_maintenance,
				activity: req.body.activity,
				parts: req.body.parts,
				frequency: req.body.frequency,
				priority: req.body.priority,
				responsible: req.body.responsible,
				procedure_maintenance: req.body.procedure_maintenance,
				days_stop: req.body.days_stop,
				description_maintenance: req.body.description_maintenance,
				id_Equipo: req.body.id_Equipo,
				created_At: date,
				updated_At: date,
			};

			connection.query(sql, customerObj, (error) => {
				if (error)
					return res
						.status(400)
						.json({ mensaje: "No se puede añadir el mantenimiento.", error });
				res.status(200).json({ mensaje: "Mantenimiento creado correctamente." });
			});
		} catch (error) {
			return res
				.status(500)
				.json({ mensaje: "No se ha podido realizar la operación. " + error });
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
