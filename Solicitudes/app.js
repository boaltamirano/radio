const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8006;
const app = express();
const { header, check } = require("express-validator");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MySql
//const connection = mysql.createConnection({
//	host: "dbRadio",
//	user: "dbuser",
//	password: "dbuser",
//	database: "vinculacion",
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
	res.status(200).json({ mensaje: "Welcome to my API! --Solicitudes" });
});
//? Encontrar las solicitudes Urgentes
app.get(
	"/find/solicitud_urgente",
	[
		//es admin
		header("rol", "El usuario no tiene permiso para realizar la acción.").isIn([
			"ADMINISTRADOR",
		]),
		validarCampos,
	],
	(req, res) => {
		try {
			const sql = "SELECT * FROM solicitudes WHERE estado_solicitud=?";
			connection.query(sql, [(estado_solicitud = "URGENTE")], (err, results) => {
				if (err)
					return res.status(400).json({
						err,
					});
				if (results.length > 0) {
					return res.status(200).json(results);
				} else {
					return res
						.status(200)
						.json({ mensaje: "No se encontraron solicitudes urgentes. " });
				}
			});
		} catch (error) {
			return res
				.status(500)
				.json({ mensaje: "No se puede realizar la operación. " });
		}
	}
);
//*ADMINISTRADOR
//TODO: Aprobar las solicitudes urgentes
//TODO: Rechazar solicitud urgente
//? Encontrar las solicitudes Pendientes

app.get(
	"/find/solicitud_pendiente",
	[
		//verificar si es admin
		header("rol", "El usuario no tiene permiso para realizar la acción. ").isIn([
			"ADMINISTRADOR",
		]),
		validarCampos,
	],
	(req, res) => {
		try {
			const sql = "SELECT * FROM solicitudes WHERE estado_solicitud=?";
			connection.query(
				sql,
				[(estado_solicitud = "ESPERANDO APROBACION")],
				(error, results) => {
					if (error) return res.status(400).json(error);
					if (results.length > 0) {
						return res.status(200).json(results);
					} else {
						return res
							.status(200)
							.json({ mensaje: "No se encontraron solicitudes pendientes. " });
					}
				}
			);
		} catch (error) {
			return res.status(500).json("No se puede realizar la acción. " + error);
		}
	}
);

//TODO: Solicitud de aprobación
//TODO: Eliminar solicitud pendiente

//? Encontrar las solicitudes Aprobadas & EN PROCESO

app.get(
	"/find/solicitud_aprobada",
	[
		//verificar si es admin
		header("rol", "El usuario no tiene permiso para realizar la acción. ").isIn([
			"ADMINISTRADOR",
		]),
		validarCampos,
	],
	(req, res) => {
		try {
			const sql =
				"SELECT * FROM solicitudes WHERE estado_solicitud=? OR estado_solicitud=?";
			connection.query(
				sql,
				[(estado_solicitud = "APROBADA"), (estado_solicitud = "EN PROCESO")],
				(error, results) => {
					if (error) return res.status(400).json(error);
					if (results.length > 0) {
						return res.status(200).json(results);
					} else {
						return res
							.status(200)
							.json({ mensaje: "No se encontraron solicitudes aprobadas. " });
					}
				}
			);
		} catch (error) {
			return res.status(500).json("No se puede realizar la acción. " + error);
		}
	}
);

//TODO: Generar orden de mantenimiento
//TODO: PDF de orden de mantenimiento
//TODO: Generar solicitud de finalización
//TODO: Eliminar las solicitudes Aprobadas & EN PROCESO

//? Get de las solicitudes finalizadas

app.get(
	"/find/solicitud_finalizada",
	[
		//verificar si es admin
		header("rol", "El usuario no tiene permiso para realizar la acción. ").isIn([
			"ADMINISTRADOR",
		]),
		validarCampos,
	],
	(req, res) => {
		try {
			const sql = "SELECT  FROM solicitudes ss WHERE estado_solicitud=?";
			connection.query(
				sql,
				[(estado_solicitud = "FINALIZADA")],
				(error, results) => {
					if (error) return res.status(400).json(error);
					if (results.length > 0) {
						return res.status(200).json(results);
					} else {
						return res
							.status(200)
							.json({ mensaje: "No se encontraron solicitudes finalizadas. " });
					}
				}
			);
		} catch (error) {
			return res.status(500).json("No se puede realizar la acción. " + error);
		}
	}
);

//TODO:Ver Solicitud Finalizada
//TODO: PDF Mantenimiento Finalizado
//TODO:Eliminar las solicitudes Finalizadas

app.get("/findById/:id", (req, res) => {
	try {
		const { id } = req.params;
		const sql = `SELECT * FROM solicitudes WHERE id = ${id}`;
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
//*USUARIO
//? Crear Solicitud de Mantenimiento
app.post(
	"/create/solicitud",
	[
		//validar q sea usuario
		header("rol", "Para crear una solicitud debe tener el rol de Usuario.").isIn([
			"USUARIO",
		]),
		//validar hora de solicitud
		check(
			"solicitud_hora_mantenimiento",
			"La hora del mantenimiento es necesaria."
		)
			.not()
			.isEmpty(),
		//validar fecha de solicitud
		check(
			"solicitud_fecha_mantenimiento",
			"La fecha del mantenimiento es necesaria."
		).isDate(),
		//validar area
		check("solicitud_area_mantenimiento", "El area no es valida").isIn([
			"SECRETARIA",
			"EDICION",
			"GRABACION",
			"MASTER AM",
			"MASTER FM",
		]),
		//validar motivo
		check(
			"solicitud_motivo_mantenimiento",
			"El motivo del mantenimiento es necesaria."
		)
			.not()
			.isEmpty(),
		//validar observaciones
		check(
			"solicitud_observaciones_mantenimiento",
			"La observación del mantenimiento es necesario."
		)
			.not()
			.isEmpty(),
		//validar partes
		check("parte_solicitud", "La parte es incorrecta.").isIn([
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
		//validación de estado
		check("estado_solicitud", "El estado de la solicitud es incorrecta.").isIn([
			"URGENTE",
			"ESPERANDO APROBACION",
		]),
		//mensajes de error de validaciones
		validarCampos,
	],
	(req, res) => {
		try {
			/*
			?Claves Foraneas
			Equipo
			Mantenimiento
			Usuario
			Componente
			SELECT * FROM solicitudes ss INNER JOIN usuarios us ON ss.id_Usuario=us.idUsuario
			*/
			//filtro de solicitud creada por hora y fecha
			let sql =
				"SELECT * FROM solicitudes WHERE solicitud_hora_mantenimiento=? AND solicitud_fecha_mantenimiento=? AND solicitud_area_mantenimiento=? AND parte_solicitud=?";

			connection.query(
				sql,
				[
					(solicitud_hora_mantenimiento = req.body.solicitud_hora_mantenimiento),
					(solicitud_fecha_mantenimiento = req.body.solicitud_fecha_mantenimiento),
					(solicitud_area_mantenimiento = req.body.solicitud_area_mantenimiento),
					(parte_solicitud = req.body.parte_solicitud),
				],
				(error, data) => {
					if (error) return res.status(400).json({ error });
					if (data.length != 0) {
						return res
							.status(400)
							.json({ mensaje: "La solicitud ya ha sido creada." });
					} else {
						sql = "INSERT INTO solicitudes SET ?";

						const customerObj = {
							solicitud_hora_mantenimiento: req.body.solicitud_hora_mantenimiento,
							solicitud_fecha_mantenimiento: req.body.solicitud_fecha_mantenimiento,
							solicitud_area_mantenimiento: req.body.solicitud_area_mantenimiento,
							solicitud_motivo_mantenimiento: req.body.solicitud_motivo_mantenimiento,
							solicitud_observaciones_mantenimiento:
								req.body.solicitud_observaciones_mantenimiento,
							parte_solicitud: req.body.parte_solicitud,
							estado_solicitud: req.body.estado_solicitud,
							tiempo_duracion: req.body.tiempo_duracion || "",
							hora_salida_solicitud: req.body.hora_salida_solicitud || "",
							hora_regreso_solicitud: req.body.hora_regreso_solicitud || "",
							updated_At: date,
							deleted_At: req.body.deleted_At || "",
						};

						connection.query(sql, customerObj, (error) => {
							if (error)
								return res
									.status(400)
									.json({ mensaje: "No se puede generar la solicitud. " + error });

							res.status(200).json({ mensaje: "La solicitud ha sido creada." });
						});
					}
				}
			);
		} catch (error) {
			return res.status(500).json({ mensaje: "Algo salió mal. " + error });
		}
	}
);

app.delete("/delete/solicitud/:id", (req, res) => {
	try {
		const { id } = req.params;
		const sql = `DELETE FROM solicitudes WHERE id= ${id}`;

		connection.query(sql, (error) => {
			if (error) return res.status(400).send(error);
			res.send("Delete user");
		});
	} catch (error) {
		return res.status(400).send(error);
	}
});

connection.connect((error) => {
	if (error) throw error;
	console.log("Database server running!");
});

app.listen(PORT, "0.0.0.0", () =>
	console.log(`Server running on port ${PORT}`)
);
