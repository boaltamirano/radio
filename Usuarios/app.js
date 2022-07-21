const express = require("express");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8002;
const app = express();
const { connection } = require("./database/database");
const { check } = require("express-validator");
const { v4: uuidv4 } = require("uuid");

app.use(bodyParser.json());
//variables globales
const date = new Date();

//helpers
const { esRoleValido } = require("./helpers/dbValidations");

//middlewares
const { validarCampos } = require("./middlewares/validateFields");
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
				res.json(result);
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
		check("password", "El password debe ser más de 6 caracteres").isLength({
			min: 6,
		}),
		check("email", "El correo no es válido").isEmail(),
		//control de roles
		check("rol", "No es un rol válido").isIn(["USUARIO", "ADMINISTRADOR"]),
		validarCampos,
	],
	(req, res) => {
		try {
			const sql = "INSERT INTO usuarios SET ?";

			const username = req.body.username;
			const email = req.body.email;
			const rol = req.body.rol;
			const area = req.body.area;
			const password = req.body.password;

			//VALIDACIONES PARA USUARIOS

			const customerObj = {
				username: username || "",
				name_user: req.body.name_user || "",
				email: email || "",
				rol: rol || "",
				area: area || "",
				password: req.body.password || "",
				created_At: date || "",
				updated_At: req.body.updated_At || "",
				deleted_At: req.body.deleted_At || "",
			};

			connection.query(sql, customerObj, (error) => {
				if (error) return res.status(400).send(error);
				res.status(200).json({ mensaje: "User created!" });
			});
		} catch (error) {
			return res
				.status(400)
				.json({ mensaje: "El Usuario no se pudo crear", error });
		}
	}
);

app.delete("/delete/users/:id", (req, res) => {
	try {
		const { id } = req.params;
		const sql = `DELETE FROM usuarios WHERE id= ${id}`;

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
