const existeEmail = (email) => {
	//console.log(email);
	//console.log(connection);
	const sql = "SELECT email FROM usuarios WHERE email=?";
	connection.query(sql, email, (err, data) => {
		if (err) {
			console.log(err);
		}
		if (data) {
			console.log(data);
		}
	});
};

module.exports = { existeEmail };
