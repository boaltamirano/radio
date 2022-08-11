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
				[(estado_solicitud = "APROBADO"), (estado_solicitud = "EN PROCESO")],
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
			const sql = "SELECT * FROM solicitudes WHERE estado_solicitud=?";
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

app.post("/create/solicitud", [], (req, res) => {
	try {
		const sql = "INSERT INTO solicitudes SET ?";

		const customerObj = {
			request_date_maintenance: req.body.request_date_maintenance || "",
			request_hour_maintenance: req.body.request_hour_maintenance || "",
			request_area_maintenance: req.body.request_area_maintenance || "",
			request_motive_maintenance: req.body.request_motive_maintenance || "",
			request_observations_maintenance:
				req.body.request_observations_maintenance || "",
			time_duration: req.body.time_duration || "",
			hour_exit_request: req.body.hour_exit_request || "",
			hour_comeback_request: req.body.hour_comeback_request || "",
			state: req.body.state,
			updated_At: req.body.updated_At || "",
			deleted_At: req.body.deleted_At || "",
		};

		connection.query(sql, customerObj, (error) => {
			if (error) return res.status(400).send(error);
			res.send("Solicitud created!");
		});
	} catch (error) {
		return res.status(400).send(error);
	}
});

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
