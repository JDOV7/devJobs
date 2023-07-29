const mongoose = require("mongoose");
require("./config/db");
const express = require("express");
const exhbs = require("express-handlebars");
const path = require("path");
require("dotenv").config({ path: "variables.env" });
const router = require("./routes");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bodyParser = require("body-parser");
// const expressValidator = require("express-validator");
const flash = require("connect-flash");
const createError = require("http-errors");
const passport = require("./config/passport");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//validacion de campos
// app.use(expressValidator());

//habilia handlebars como view
app.engine(
  "handlebars",
  exhbs.engine({
    defaultLayout: "layout",
    helpers: require("./helpers/handlebars"),
  })
);
app.set("view engine", "handlebars");

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE }),
  })
);
//iniciar passport
app.use(passport.initialize());
app.use(passport.session());

//static files

app.use(express.static(path.join(__dirname, "public")));

//alertas y flash messages

app.use(flash());

//crear nuestro middleware

app.use((req, res, next) => {
  res.locals.mensajes = req.flash();
  next();
});

app.use("/", router());

app.use((req, res, next) => {
  next(createError(404, "No Encontrado"));
});

app.use((error, req, res, next) => {
  // console.log(error.message);
  res.locals.mensaje = error.message;
  const status = error.status || 500;
  res.locals.status = status;
  res.status(status);
  res.render("error");
});

const host = "0.0.0.0";
const port = process.env.PORT;

app.listen(port, host, () => {
  console.log("el servidor esta funcioanndo");
});
