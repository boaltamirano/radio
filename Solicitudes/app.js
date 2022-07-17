const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8002;
const app = express();
const { v4: uuidv4 } = require("uuid");

app.use(bodyParser.json());

const date = new Date();

// MySql
const connection = mysql.createConnection({
	host: "dbRadio",
	user: "dbuser",
	password: "dbuser",
	database: "vinculacion",
});

app.get("/", (req, res) => {
	res.send("Welcome to my API!");
});

app.get("/find/solicitud", (req, res) => {
	try {
		const sql = "SELECT * FROM solicitudes";
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

app.post("/create/solicitud", (req, res) => {
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
	if (error) return res.status(400).send(error);
	console.log("Database server running!");
});

app.listen(PORT, "0.0.0.0", () =>
	console.log(`Server running on port ${PORT}`)
);
