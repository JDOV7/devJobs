## Tabla de Contenidos
1. [Informacion General](#informacion-general)
2. [Tecnologias](#tecnologias)
3. [Instalacion](#instalacion)
## Informacion General
***
Esta es una aplicacion web que tiene como finalidad que reclutadores publiquen ofertas de trabajo sobre desarrollo, asi como tambien dasarrolladores apliquen a estas vacantes, la aplicacion cuenta con las siguientes funcionalidades:
* Creacion de cuentas con envio de correo para validar
* Inicio de sesion
* Cierre de sesion
* Actualizacion de perfil con cambio de foto de perfil
* Reestablecimiento de contraseña con envio de correo para validacion
* Creacion de vacante
* Actualizacion de vacante
* Eliminacion de vacante
* Busqueda de vacante
* Aplicar a vacante
* Envio de CV por medio de archivo PDF
## Tecnologias
***
Tecnologias usadas:
* NodeJS: Version 18.14.2
* Express: Version 4.18.2
* Mongoose: Version 7.4.0
* Multer: Version 1.4.5-lts.1
* Nodemailer: Version 6.9.4
* Handlebars: Version 7.1.0
* [Trix](https://github.com/basecamp/trix/tree/custom-elements-v1): Version 1
## Instalacion
***
Para la instalacion, primero tener ```node 18.14.2```
```
$ git clone https://github.com/JDOV7/devJobs.git
$ cd ../path/to/the/file
$ npm install
$ npm run desarrollo
```
Ademas de esto se debe tener una base de datos en Mongo y tener una cuenta en mailtrap para probar los correos.
