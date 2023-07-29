const mongoose = require("mongoose");
const Usuarios = mongoose.model("Usuarios");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const shortId = require("shortid");

exports.formCrearCuenta = (req, res) => {
  res.render("crear-cuenta", {
    nombrePagina: "Crea tu cuenta en devJobs",
    tagline:
      "Comienza a publicar tus vacantes gratis, solo debes crear una cuenta",
  });
};

exports.crearUsuario = async (req, res, next) => {
  console.log("Creando usuario");
  console.log(req.body);
  const usuario = new Usuarios(req.body);
  try {
    const nuevoUsuario = await usuario.save();
    return res.redirect("/iniciar-sesion");
  } catch (error) {
    req.flash("error", error);
    return res.redirect("/crear-cuenta");
  }
  // if (!nuevoUsuario) {
  //   return next();
  // }
  // res.redirect("/iniciar-sesion");
  // console.log(usuario);
};

exports.validarRegistro = async (req, res, next) => {
  // console.log(req.body);
  // await body('nombre').escape().withMessage('sanitizado').run(req);
  await body("nombre", "El nombre es obligatorio")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .run(req);
  await body("email", "El email debe ser valido")
    .trim()
    .escape()
    .isEmail()
    .run(req);
  await body("password", "El password no puede ir vacio")
    .trim()
    .escape()
    .notEmpty()
    .run(req);

  await body("confirmar", "Confirmar password no puede ir vacio")
    .trim()
    .escape()
    .notEmpty()
    .run(req);

  await body("confirmar", "El password es diferente")
    .trim()
    .escape()
    .equals(req.body.password)
    .run(req);

  let errores = validationResult(req);
  console.log(errores.errors);

  if (errores.errors.length >= 1) {
    // console.log(errores);
    req.flash(
      "error",
      errores.errors.map((error) => {
        return error.msg;
      })
    );
    return res.render("crear-cuenta", {
      nombrePagina: "Crea tu cuenta en devJobs",
      tagline:
        "Comienza a publicar tus vacantes gratis, solo debes crear una cuenta",

      mensajes: req.flash(),
    });
  }
  return next();
};

exports.formIniciarSesion = async (req, res) => {
  res.render("iniciar-sesion", {
    nombrePagina: "Iniciar Sesion devJobs",
  });
};

exports.formEditarPerfil = async (req, res) => {
  res.render("editar-perfil", {
    nombrePagina: "Edita tu perfil en devJobs",
    usuario: req.user.toObject(),
    cerrarSesion: true,
    imagen: req.user.imagen,
    nombre: req.user.nombre,
  });
};

exports.editarPerfil = async (req, res) => {
  const usuario = await Usuarios.findById(req.user._id);
  // console.log(usuario);
  usuario.nombre = req.body.nombre;
  usuario.email = req.body.email;
  if (req.body.password) {
    usuario.body = req.usuario.body;
  }
  // console.log(req.file);
  // return;
  if (req.file) {
    usuario.imagen = req.file.filename;
  }
  await usuario.save();
  req.flash("correcto", "Cambios Guardados Correctamente");
  res.redirect("/administracion");
};

exports.validarPerfil = async (req, res, next) => {
  await body("nombre", "El nombre no puede ir vacion").trim().escape();
  await body("email", "El correo no puede ir vacio").trim().escape();

  if (req.body.password) {
    await body("password", "El nombre es obligatorio").trim().escape();
  }

  await body("nombre", "El nombre no puede ir vacion").notEmpty().run(req);
  await body("email", "El correo no puede ir vacio").notEmpty().run(req);

  let errores = validationResult(req);
  if (errores.errors.length >= 1) {
    req.flash(
      "error",
      errores.errors.map((error) => {
        return error.msg;
      })
    );
    return res.render("editar-perfil", {
      nombrePagina: "Edita tu perfil en devJobs",
      usuario: req.user.toObject(),
      cerrarSesion: true,
      nombre: req.user.nombre,
      imagen: req.user.imagen,
      mensajes: req.flash(),
    });
  }
  next();
};

exports.subirImagen = async (req, res, next) => {
  upload(req, res, function (error) {
    // console.log(error);
    if (error) {
      console.log(error);
      if (error instanceof multer.MulterError) {
        // return next();
        if (error.code === "LIMIT_FILE_SIZE") {
          req.flash("error", "El archivo es muy grande, maximo 100kb");
        } else {
          req.flash("error", error.message);
        }
      } else {
        // if (error.hasOwnProperty("message")) {
        req.flash("error", error.message);
        // }
        // req.flash("error", error.message);
      }
      // if (error.hasOwnProperty("message")) {
      // req.flash("error", error.message);
      // }

      return res.redirect("/administracion");
    } else {
      return next();
    }
  });
};

const configuracionMulter = {
  limits: { fileSize: 100000 },
  storage: (fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname + "../../public/uploads/perfiles");
    },
    filename: (req, file, cb) => {
      // cb(null, file);
      const extension = file.mimetype.split("/")[1];
      // console.log(`${shortId.generate()}.${extension}`);
      cb(null, `${shortId.generate()}.${extension}`);
    },
  })),
  fileFilter(req, file, cb) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Formato no Valido"), false);
    }
  },
};
const upload = multer(configuracionMulter).single("imagen");
