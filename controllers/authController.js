const passport = require("passport");
const Vacantes = require("../models/Vacantes");
const Usuarios = require("../models/Usuarios");
const crypto = require("crypto");
const enviarEmail = require("../handlers/email");

exports.autenticarUsuario = passport.authenticate("local", {
  successRedirect: "/administracion",
  failureRedirect: "/iniciar-sesion",
  failureFlash: true,
  badRequestMessage: "Ambos campos son obligatorios",
});

//revisar si el usuario esta autenticado o no
exports.verificarUsuario = async (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  //redirecionar
  return res.redirect("/iniciar-sesion");
};

exports.mostrarPanel = async (req, res) => {
  const vacantes = await Vacantes.find({ autor: req.user._id }).lean();

  res.render("administracion", {
    nombrePagina: "Panel de Administracion",
    tagline: "Crea y administra tus vacantes desde aqui",
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
    vacantes,
  });
};

exports.cerrarSesion = async (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("correcto", "Cerraste Sesion Correctamente");
    return res.redirect("/iniciar-sesion");
  });
};

exports.formRestablecerPassword = (req, res, next) => {
  res.render("restablecer-password", {
    nombrePagina: "Reestablece tu password",
    tagline:
      "Si ya tienes una cuenta pero olvidaste tu password, coloca tu email",
  });
};

exports.enviarToken = async (req, res) => {
  const usuario = await Usuarios.findOne({ email: req.body.email });

  if (!usuario) {
    req.flash("error", "No existe ese cuenta");
    return res.redirect("/iniciar-sesion");
  }
  usuario.token = crypto.randomBytes(20).toString("hex");
  usuario.expira = Date.now() + 3600000;

  await usuario.save();

  const resetUrl = `http://${req.headers.host}/restablecer-password/${usuario.token}`;
  console.log(resetUrl);

  await enviarEmail.enviar({
    usuario,
    subject: "Password Reset",
    resetUrl,
    archivo: "reset",
  });

  req.flash("correcto", "Revisa tu email para las indicaciones");
  return res.redirect("/iniciar-sesion");
};

exports.reestablecePassword = async (req, res, next) => {
  const usuario = await Usuarios.findOne({
    token: req.params.token,
    expira: {
      $gt: Date.now(),
    },
  });
  // console.log(usuario);
  if (!usuario) {
    req.flash("error", "El formulario ya no es valido, intenta de nuevo");
    return res.redirect("/restablecer-password");
  }
  return res.render("nuevo-password", {
    nombrePagina: "Nuevo password",
  });
};

exports.guardarPassword = async (req, res) => {
  const usuario = await Usuarios.findOne({
    token: req.params.token,
    expira: {
      $gt: Date.now(),
    },
  });

  if (!usuario) {
    req.flash("error", "El formulario ya no es valido, intenta de nuevo");
    return res.redirect("/restablecer-password");
  }

  usuario.password = req.body.password;
  usuario.token = undefined;
  usuario.expira = undefined;

  await usuario.save();
  req.flash("correcto", "Password modificado correctamente");
  return res.redirect("/iniciar-sesion");
};
