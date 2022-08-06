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
//variables globales
const date = new Date();
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
			const sql = `SELECT * FROM componentes WHERE state_component=?`;
			connection.query(sql, [(state_component = "ACTIVE")], (error, results) => {
				if (error)
					return res
						.status(400)
						.json({ mensaje: "La búsqueda no se pudo realizar.", error });
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

// TODO: Realizar un Get para los componentes eliminados

app.get(
	"/findById/:id",
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
	}
);

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
		//control área
		check("component_area", "El area ingresada no es valida.").isIn([
			"SECRETARIA",
			"EDICION",
			"GRABACION",
			"MASTER AM",
			"MASTER FM",
		]),
		//control de fecha de adquisicion
		check("date_purchase", "El formato de fecha no es correcto").isDate(),
		//control de año del equipo
		check("year_component", "El formato de fecha no es correcto").isDate(),
		//control de prioridad
		check(
			"component_priority",
			"La prioridod es incorrecta verifique nuevamente."
		).isIn(["ALTA", "MEDIA", "BAJA"]),
		validarCampos,
	],
	(req, res) => {
		try {
			let sql = `SELECT * FROM equipos WHERE idEquipo = ${req.body.id_Equipo}`;

			// ? Query de busqueda en la tabla de equipos con id de tabla de componentes
			connection.query(sql, (error, data) => {
				// ?error en la busqueda en la tabla de equipos
				if (error)
					return res.status(400).json({
						mensaje: "No se puede encontrar el equipo.",
						error,
					});
				// ? Query para saber si esque ya existe el componente
				if (data.length > 0) {
					sql =
						"SELECT * FROM componentes WHERE component_name=? AND component_brand=? AND component_area=?";

					connection.query(
						sql,
						[
							req.body.component_name,
							req.body.component_brand,
							req.body.component_area,
						],
						(err, data) => {
							// ? Mensaje para el componente ya exise
							if (err || data.length > 0)
								return res.status(400).json({
									mensaje: "El componente ya existe.",
									err,
								});
							//? Se inserta en la tabla de componentes el nuevo componente
							let sql = "INSERT INTO componentes SET ?";
							const customerObj = {
								component_name: req.body.component_name,
								component_brand: req.body.component_brand,
								component_area: req.body.component_area,
								serial_number: req.body.serial_number,
								date_purchase: req.body.date_purchase,
								year_component: req.body.year_component,
								component_priority: req.body.component_priority,
								state_component: req.body.state_component || "ACTIVE",
								id_Equipo: req.body.id_Equipo,
								created_At: date,
								updated_At: date,
								deleted_At: req.body.deleted_At || "",
							};
							connection.query(sql, customerObj, (err, data) => {
								// ? error en el ingreso a la tabla de componentes
								if (err)
									return res.status(400).json({
										mensaje: "No se puede ingresar los datos.",
										err,
									});
								res
									.status(200)
									.json({ mensaje: "Componente creado", data: data.affectedRows });
							});
						}
					);
				}
			});
		} catch (error) {
			return res.status(500).json({ error: "Algo salio mal ", error });
		}
	}
);

app.delete(
	"/delete/components/:id",
	[
		header("rol", "El Usuario no tiene permisos para realizar esto.").isIn([
			"ADMINISTRADOR",
		]),
		validarCampos,
	],
	(req, res) => {
		try {
			const { id } = req.params;
			const number = /^[0-9]+$/;
			//const result = number.test(id);
			//console.log(result);
			if (!number.test(id)) {
				console.log("El id es equivocado");
				return res.status(400).json({ mensaje: "El id es incorrecto" });
			} else {
				sql = `SELECT * FROM componentes WHERE idComponente=${id}`;

				connection.query(sql, (error, data) => {
					if (error || data.length == 0)
						return res.status(400).json({
							mensaje: `No se puede borrar el componente con id ${id} .`,
							error,
						});
					// ? No se debe borrar se debe actualizar el deleted_at y cambiar el estado
					//sql = `DELETE FROM componentes WHERE idComponente= ${id}`;
					sql = `UPDATE componentes SET deleted_At=?, state_component=? WHERE idComponente=${id}`;

					connection.query(
						sql,
						[(deleted_At = date), (state_component = "INACTIVE")],
						(err) => {
							if (err) res.status(400).json({ mensaje: "No se puede borrar", err });
							res.status(200).json({ mensaje: "Usuario borrado" });
						}
					);
				});
			}
		} catch (error) {
			return res.status(500).json(error);
		}
	}
);

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
