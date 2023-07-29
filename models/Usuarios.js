const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const bcrypt = require("bcrypt");

const usuariosSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true, trim: true },
  nombre: { type: String, required: true },
  password: { type: String, required: true, trim: true },
  token: String,
  expira: Date,
  imagen: String,
});

//metodo para hashear los password

usuariosSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const hash = await bcrypt.hash(this.password, 12);
  this.password = hash;
  next();
});

//envia alerta cuando un usuario ya esta registrado
usuariosSchema.post("save", async function (error, doc, next) {
  console.log("post save");
  if (error.name === "MongoServerError" && error.code === 11000) {
    next("Ese correo ya esta registrado");
  } else {
    next(error);
  }
});

//autenticar ususairoos
usuariosSchema.methods = {
  compararPassword: function (password) {
    return bcrypt.compareSync(password, this.password);
  },
};

module.exports = mongoose.model("Usuarios", usuariosSchema);
