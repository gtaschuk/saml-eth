const dotenv = require("dotenv");
const routes = require("express").Router();
const passport = require("passport");
//const isAuthenticated = require("../middlewares/isAuthenticated");

dotenv.config();

//routes.get("/signIn", isAuthenticated, signIn);

//routes.post("/login", (req, res, next) => {
  //passport.authenticate("local", (err, user, info) => {
    //if (err) {
      //return next(err);
    //}
    //if (!user) {
      //return res.sendStatus(401);
    //}
    //req.logIn(user, err => {
      //if (err) {
        //return next(err);
      //}
      //return res.json(user);
    //});
  //})(req, res, next);
//});

//routes.get("/logout", (req, res) => {
  //req.logout();
  //res.status(200).json({ success: "Logged out successfully" });
//});

routes.get("/", (req, res) => res.json({ msg: "SAML IDP" }));

module.exports = routes;
