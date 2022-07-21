const { connection = con } = require("../database/database");
roles = ["USUARIO", "ADMINISTRADOR"];

const esRoleValido = (rol) => {
	const existRol = roles.filter(rol);
	if (!existRol) {
		throw new Error(`El rol ${rol} no está registrado en la base de datos`);
	}
};

module.exports = { esRoleValido };
