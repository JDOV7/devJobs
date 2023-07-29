const mongoose = require("mongoose");
const Vacante = mongoose.model("Vacante");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const shortId = require("shortid");
exports.formularioNuevaVacante = (req, res) => {
  res.render("nueva-vacante", {
    nombrePagina: "Nueva Vacante",
    tagline: "Llena el formulario y publica tu vacante",
    cerrarSesion: true,
    imagen: req.user.imagen,
    nombre: req.user.nombre,
  });
};

exports.agregarVacante = async (req, res) => {
  const vacante = new Vacante(req.body);

  //usuario autor de la vacante

  vacante.autor = req.user._id;

  vacante.skills = req.body.skills.split(",");
  // console.log(vacante);
  const nuevaVacante = await vacante.save();

  res.redirect(`/vacantes/${nuevaVacante.url}`);
};

exports.mostrarVacante = async (req, res, next) => {
  const vacante = await Vacante.findOne({ url: req.params.url })
    .populate("autor")
    .lean();

  console.log(vacante);
  if (!vacante) {
    return next();
  }

  res.render("vacante", { vacante, nombrePagina: vacante.titulo, barra: true });
};

exports.formEditarVacante = async (req, res, next) => {
  const vacante = await Vacante.findOne({ url: req.params.url }).lean();

  if (!vacante) {
    return next();
  }

  if (!req?.user?._id || vacante.autor.toString() !== req.user._id.toString()) {
    // console.log("es igual");
    return res.redirect("/");
  }

  res.render("editar-vacante", {
    vacante,
    nombrePagina: `Editar -${vacante.titulo}`,
    cerrarSesion: true,
    imagen: req.user.imagen,
    nombre: req.user.nombre,
  });
};

exports.editarVacante = async (req, res, next) => {
  const vacanteActualizada = req.body;
  vacanteActualizada.skills = req.body.skills.split(",");

  const vacante = await Vacante.findOneAndUpdate(
    { url: req.params.url },
    vacanteActualizada,
    { new: true, runValidators: true }
  );
  res.redirect(`/vacantes/${vacante.url}`);
  // console.log(vacanteActualizada);
};

// validar y sanitizar los campos de lsa nuevas vacants
exports.validarVacante = async (req, res, next) => {
  await body("titulo", "Agrega un titulo a la vacante").trim().escape();
  await body("empresa", "El nombre es obligatorio").trim().escape();
  await body("ubicacion", "Agrega una ubicacion").trim().escape();
  await body("contrato", "Selecciona un tipo de contrato").trim().escape();
  await body("skills", "Agrega almenos una habilidad").trim().escape();

  await body("titulo", "Agrega un titulo a la vacante").notEmpty().run(req);
  await body("empresa", "Agrega una empresa").notEmpty().run(req);
  await body("ubicacion", "Agrega una ubicacion").notEmpty().run(req);
  await body("contrato", "Selecciona un tipo de contrato").notEmpty().run(req);
  await body("skills", "Agrega almenos una habilidad").notEmpty().run(req);

  let errores = validationResult(req);
  // console.log(errores);
  // return;
  if (errores.errors.length >= 1) {
    req.flash(
      "error",
      errores.errors.map((error) => {
        return error.msg;
      })
    );
    return res.render("nueva-vacante", {
      nombrePagina: "Nueva Vacante",
      tagline: "Llena el formulario y publica tu vacante",
      cerrarSesion: true,
      nombre: req.user.nombre,
      mensajes: req.flash(),
    });
  }
  next();
};

exports.eliminarVacante = async (req, res) => {
  const { id } = req.params;

  const vacante = await Vacante.findById(id);
  // console.log(vacante);
  if (verificarAutor(vacante, req.user)) {
    await Vacante.deleteOne({ _id: id });
    res.status(200).send("Vacante Eliminada Correctamente");
  } else {
    res.status(403).send("Error");
  }
};

const verificarAutor = async (vacante = {}, usuario = {}) => {
  if (!vacante.autor.equals(usuario._id)) {
    return false;
  }
  return true;
};

exports.subirCV = async (req, res, next) => {
  upload(req, res, function (error) {
    // console.log(error);
    if (error) {
      console.log(error);
      if (error instanceof multer.MulterError) {
        // return next();
        if (error.code === "LIMIT_FILE_SIZE") {
          req.flash("error", "El archivo es muy grande, maximo 300kb");
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

      return res.redirect("back");
    } else {
      return next();
    }
  });
};

const configuracionMulter = {
  limits: { fileSize: 300000 },
  storage: (fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, __dirname + "../../public/uploads/cv");
    },
    filename: (req, file, cb) => {
      // cb(null, file);
      const extension = file.mimetype.split("/")[1];
      // console.log(`${shortId.generate()}.${extension}`);
      cb(null, `${shortId.generate()}.${extension}`);
    },
  })),
  fileFilter(req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Formato no Valido"), false);
    }
  },
};

const upload = multer(configuracionMulter).single("cv");

exports.contactar = async (req, res, next) => {
  // console.log(req.params.url);
  const vacante = await Vacante.findOne({ url: req.params.url });
  if (!vacante) {
    return next();
  }
  const nuevoCandidato = {
    nombre: req.body.nombre,
    email: req.body.email,
    cv: req.file.filename,
  };
  vacante.candidatos.push(nuevoCandidato);
  await vacante.save();

  req.flash("correcto", "Se envio tu curriculum correctamente");
  return res.redirect("/");
};

exports.mostrarCandidatos = async (req, res, next) => {
  // console.log(req.params.id);
  const vacante = await Vacante.findById(req.params.id).lean();

  if (!vacante) {
    return next();
  }

  if (vacante.autor.toString() !== req.user._id.toString()) {
    // console.log("es igual");
    return next();
  }

  // console.log('pasamos la validacion');
  res.render("candidatos", {
    nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
    candidatos: vacante.candidatos,
  });
};

exports.buscarVacante = async (req, res, next) => {
  const vacantes = await Vacante.find({
    $text: { $search: req.body.q },
  }).lean();
  console.log(vacantes);

  res.render("home", {
    nombrePagina: `Resultados para la busqueda: ${req.body.q}`,
    barra: true,
    vacantes,
  });
};
