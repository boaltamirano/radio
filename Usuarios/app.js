const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const PORT = process.env.PORT || 8002;
const app = express();
const { check, header, param } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//MySQL
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
	res.json({ mensaje: "Welcome to my API! --Usuarios" });
});

app.get(
	"/find/users",
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
			const sql = "SELECT * FROM usuarios WHERE state_user='ACTIVE'";
			connection.query(sql, (error, results) => {
				if (error) return res.status(400).send(error);
				if (results.length > 0) {
					return res.status(200).json({ results });
				} else {
					return res
						.status(400)
						.json({ mensaje: "No se encontró usuarios en la base de datos." });
				}
			});
		} catch (error) {
			return res.status(400).json({ error });
		}
	}
);

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
			const number = /^[0-9]+$/;
			//const result = number.test(id);
			//console.log(result);
			if (!number.test(id)) {
				// console.log("El id es equivocado");
				return res.status(400).json({ mensaje: "El id es incorrecto" });
			} else {
				const sql = `SELECT * FROM usuarios WHERE idUsuario = ${id} AND state_user="ACTIVE"`;
				connection.query(sql, (error, result) => {
					if (error) return res.status(400).send(error);

					if (result.length > 0) {
						res.status(200).json({ result });
					} else {
						res
							.status(400)
							.json({ mensaje: `No se encontro el usuario con id ${id}` });
					}
				});
			}
		} catch (error) {
			return res.status(400).json({ error });
		}
	}
);

// ? Get para los usuarios eliminados
app.get(
	"/findDeleted",
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
			const sql = `SELECT * FROM usuarios WHERE state_user=?`;
			connection.query(sql, [(state_component = "INACTIVE")], (error, results) => {
				if (error)
					return res
						.status(400)
						.json({ mensaje: "La búsqueda no se pudo realizar.", error });
				if (results.length > 0) {
					return res.status(200).json({ results });
				} else {
					return res.status(200).json({ mensaje: "No se encontraron usuarios." });
				}
			});
		} catch (error) {
			return res.status(400).json({ error });
		}
	}
);

app.post(
	"/create/users",
	[
		check("username", "El nombre de usuario es olbigatorio --username")
			.not()
			.isEmpty(),
		check("name_user", "El nombre es olbigatorio --name_user").not().isEmpty(),
		//control email
		check("email", "El correo no es válido").isEmail(),
		/* check("email").custom((value, { req }) => {
			const sql = `SELECT email FROM usuarios WHERE email=?`;
			connection.query(sql, value, (err, data) => {
				if (err) console.log(err);
				if (data.length > 0) throw new Error("Email ya existe");
			});
		}), */
		//control de roles
		check("rol", "No es un rol válido").isIn(["USUARIO", "ADMINISTRADOR"]),
		//control área
		check("area", "El area no es valida").isIn([
			"SECRETARIA",
			"EDICION",
			"GRABACION",
			"MASTER AM",
			"MASTER FM",
		]),
		//Requisitos password
		check("password", "El password debe ser más de 6 caracteres").isLength({
			min: 6,
		}),
		validarCampos,
	],
	(req, res) => {
		try {
			const sql = "INSERT INTO usuarios SET ?";

			//encriptado de clave
			const password = req.body.password;
			const salt = bcrypt.genSaltSync(10);
			const hashPassword = bcrypt.hashSync(password, salt);

			const customerObj = {
				username: req.body.username,
				name_user: req.body.name_user,
				email: req.body.email,
				rol: req.body.rol,
				area: req.body.area,
				password: hashPassword,
				state_user: req.body.state_user || "ACTIVE",
				created_At: date,
				updated_At: date,
				deleted_At: req.body.deleted_At || "",
			};

			connection.query(sql, customerObj, (error, data) => {
				if (error)
					return res.status(400).json({
						mensaje: "No se pudo crear el usuario",
						error: error.sqlMessage,
					});
				res
					.status(200)
					.json({ mensaje: "Usuario creado", data: data.affectedRows });
			});
		} catch (error) {
			return res.status(400).json({
				mensaje: "El Usuario no se pudo crear",
				error,
			});
		}
	}
);

app.delete(
	"/delete/users/:id",
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
				/*
				 * *Primero hago una búsqueda del usuario si se encuentra en la base de datos
				 */
				sql = `SELECT * FROM usuarios WHERE idUsuario=${id}`;
				connection.query(sql, (error, data) => {
					// ? La condicional del if es para el error o para los resultados si es = a 0
					if (error || data.length == 0)
						return res.status(400).json({
							mensaje: "El id no se encuentra en la base de datos",
						});
					/*
					 * *Cuando el usuario es encontrado en la base de datos se procede a ingresar el sql para eliminarlo
					 */
					// ?No se debe borrar se debe actualizar el deleted_at y cambiar el estado
					//const sql = `DELETE FROM usuarios WHERE idUsuario= ${id}`;
					sql = `UPDATE usuarios SET deleted_At=?, state_user=? WHERE idUsuario=${id}`;
					connection.query(
						sql,
						[(deleted_At = date), (state_user = "INACTIVE")],
						(err) => {
							if (err) res.status(400).json({ mensaje: "No se puede borrar", err });
							res.status(200).json({ mensaje: "Usuario borrado" });
						}
					);
				});
			}
		} catch (error) {
			return res.status(500).json({ mensaje: error });
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

//MySQL Connect
connection.connect((error) => {
	if (error) throw error;
	console.log("Database server running!");
});

app.listen(PORT, "0.0.0.0", () =>
	console.log(`Server running on port ${PORT}`)
);
