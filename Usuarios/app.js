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

//helpers
const { existeEmail } = require("./helpers/dbValidations.js");

//middlewares
const { validarCampos } = require("./middlewares/validateFields");
//variables globales
const date = new Date();

//rutas
app.get("/", (req, res) => {
	res.json({ mensaje: "Welcome to my API!" });
});

app.get("/find/users", (req, res) => {
	try {
		const sql = "SELECT * FROM usuarios";
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

app.get("/findById/:id", (req, res) => {
	try {
		const { id } = req.params;
		const sql = `SELECT * FROM usuarios WHERE id = ${id}`;
		connection.query(sql, (error, result) => {
			if (error) return res.status(400).send(error);

			if (result.length > 0) {
				res.send(result);
			} else {
				res.send("Not result");
			}
		});
	} catch (error) {
		return res.status(400).send(error);
	}
});

app.post(
	"/create/users",
	[
		check("username", "El nombre es olbigatorio --username").not().isEmpty(),
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
				created_At: date,
				updated_At: req.body.updated_At || "",
				deleted_At: req.body.deleted_At || "",
			};

			connection.query(sql, customerObj, (error, data) => {
				if (error) return res.status(400).send(error);
				res.status(200).json({ mensaje: "User created!", data: data.affectedRows });
			});
		} catch (error) {
			return res
				.status(400)
				.json({ mensaje: "El Usuario no se pudo crear", error });
		}
	}
);

app.delete(
	"/delete/users/:id",
	[
		param("id", "El id del usuario a eliminar debe ser enviado.").exists(),
		header("rol", "El Usuario no tiene permisos para realizar esto.").isIn([
			"ADMINISTRADOR",
		]),
		validarCampos,
	],
	(req, res) => {
		try {
			const { id } = req.params;
			const sql = `DELETE FROM usuarios WHERE idUsuario= ${id}`;

			connection.query(sql, (error) => {
				if (error) return res.status(400).send(error);
				res.send("Delete user");
			});
		} catch (error) {
			return res.status(400).send(error);
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
