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
			if (error) return res.status(400).json({ error: error.sqlMessage });

			if (result.length > 0) {
				res.status(200).json({ result });
			} else {
				res.status(400).json({
					mensaje: `No se encontró ningún componente con id ${id} en la base de datos.`,
				});
			}
		});
	} catch (error) {
		return res.status(400).json({ error });
	}
});

app.post(
	"/create/components",
	[
		//verifico si es administrador
		header("rol", "El Usuario no tiene permisos para realizar esto.").isIn([
			"ADMINISTRADOR",
		]),
		//control de nombre componente
		check(
			"component_name",
			"El nombre del componente es olbigatorio. --component_name"
		)
			.not()
			.isEmpty(),
		//control de marca
		check(
			"component_brand",
			"La marca del componente es obligatoria.  --component_brand"
		)
			.not()
			.isEmpty(),
		//control de serial
		check(
			"serial_number",
			"El número de serie es incorrecto verifique de nuevo. --serial"
		)
			.not()
			.isEmpty()
			.isLength({
				min: 8,
			}),
		//control de fecha de adquisicion
		/* check("date_purchase", "Asegúrese que la fecha ingresada es correcta.")
			.isISO8601()
			.toDate(),

		//control de año del equipo
		check("year_component", "Verifique el año ingresado sea correcto.")
			.isISO8601()
			.toDate(), */

		//control de prioridad
		check(
			"component_priority",
			"La prioridod es incorrecta verifique nuevamente."
		).isIn(["ALTA", "MEDIA", "BAJA"]),
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
			const sql = "INSERT INTO componentes SET ?";

			const customerObj = {
				component_name: req.body.name_equipment,
				component_brand: req.body.component_brand,
				component_area: req.body.component_area,
				serial_number: req.body.serial_number,
				date_purchase: req.body.date_purchase || "",
				year_component: req.body.year_component || "",
				component_priority: req.body.component_priority,
				id_Equipo: req.body.id_Equipo || "",
				created_At: date,
				updated_At: date,
				deleted_At: req.body.deleted_At || "",
			};

			connection.query(sql, customerObj, (error, data) => {
				if (error)
					return res.status(400).json({ mensaje: "No se puede ingresar los datos" });
				res.status(200),
					json({ mensaje: "Componente creado", data: data.affectedRows });
			});
		} catch (error) {
			return res.status(400).json({ error: "Algo salio mal ", error });
		}
	}
);

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
