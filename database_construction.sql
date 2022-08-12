USE vinculacion;
 CREATE TABLE usuarios (
  idUsuario int NOT NULL AUTO_INCREMENT,
  username varchar(100) NOT NULL,
  name_user varchar(100) NOT NULL,
  email varchar(100) NOT NULL,
  rol varchar(20) NOT NULL,
  area varchar(20) NOT NULL,
  password varchar(100) NOT NULL,
  state_user varchar(45) NOT NULL,
  created_At varchar(100) NOT NULL,
  updated_At varchar(100) NOT NULL,
  deleted_At varchar(100) NOT NULL,
  UNIQUE(username,email),
  PRIMARY KEY (idUsuario)
);

CREATE TABLE equipos (
idEquipo int NOT NULL AUTO_INCREMENT,
name_equipment varchar(100) NOT NULL,
processor varchar(100) NOT NULL,
brand varchar(100) NOT NULL,
graphic_card varchar(100) NOT NULL,
model varchar(100) NOT NULL,
antivirus varchar(100) NOT NULL,
so varchar(100) NOT NULL,
disk_space varchar(100) NOT NULL,
ram_memory int NOT NULL,
area_equipment varchar(100) NOT NULL,
status_equipment varchar(100) NOT NULL,
date_purchased DATE NOT NULL,
equipment_year DATE NOT NULL,
cpu_priority varchar(100) NOT NULL,
created_At varchar(100) NOT NULL,
updated_At varchar(100) NOT NULL,
deleted_At varchar(100) NOT NULL,
UNIQUE(name_equipment),
PRIMARY KEY (idEquipo)
);

CREATE TABLE componentes(
  idComponente int NOT NULL AUTO_INCREMENT,
  component_name varchar(100) NOT NULL,
  component_brand varchar(100) NOT NULL,
  component_area varchar(100) NOT NULL,
  serial_number varchar(100) NOT NULL,
  date_purchase datetime NULL,
  year_component DATE NOT NULL,
  component_priority varchar(100) NOT NULL,
  state_component varchar(50) NOT NULL,
  id_Equipo int ,
  created_At varchar(100) NOT NULL,
  updated_At varchar(100) NOT NULL,
  deleted_At varchar(100) NOT NULL,
  PRIMARY KEY (idComponente),
  FOREIGN KEY (id_equipo)REFERENCES equipos(idEquipo)
);

CREATE TABLE mantenimientos (
idMantenimiento int NOT NULL AUTO_INCREMENT,
name_maintenance varchar(100) NOT NULL,
activity varchar(100) NOT NULL,
parts varchar(100) NOT NULL,
frequency varchar (100) NOT NULL,
priority varchar (100) NOT NULL,
responsible varchar (100) NOT NULL,
procedure_maintenance varchar(100) NOT NULL,
days_stop int NOT NULL,
description_maintenance varchar (100) NOT NULL,
id_Equipo int,
created_At varchar(100) NOT NULL,
updated_At varchar(100) NOT NULL,
UNIQUE(name_maintenance),
PRIMARY KEY (idMantenimiento),
FOREIGN KEY (id_Equipo) REFERENCES equipos(idEquipo)
);

CREATE TABLE solicitudes (
idSolicitud int NOT NULL AUTO_INCREMENT,
solicitud_fecha_mantenimiento DATE,
solicitud_hora_mantenimiento DATE,
solicitud_area_mantenimiento varchar(25),
solicitud_motivo_mantenimiento  varchar(25),
solicitud_observaciones_mantenimiento varchar(25),
tiempo_duracion int,
hora_salida_solicitud DATE,
hora_regreso_solicitud DATE,
estado_solicitud varchar(15) NOT NULL,
area_solicitud varchar(15) NOT NULL,
parte_solicitud varchar(15) NOT NULL,
updated_At varchar(100) NOT NULL,
deleted_At varchar(100) NOT NULL,
id_Equipo int,
id_Mantenimiento int,
id_Usuario int,
id_Componente int,
PRIMARY KEY(idSolicitud),
FOREIGN KEY (id_Equipo) REFERENCES equipos(idEquipo),
FOREIGN KEY (id_Mantenimiento) REFERENCES mantenimientos(idMantenimiento),
FOREIGN KEY (id_Usuario) REFERENCES usuarios(idUsuario),
FOREIGN KEY (id_Componente) REFERENCES componentes(idComponente)
);
