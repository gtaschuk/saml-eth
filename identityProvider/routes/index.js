const dotenv = require("dotenv");
const routes = require("express").Router();
const passport = require("passport");

const {
  parseSamlRequest,
  parseLogoutRequest
} = require("../controllers/samlController");
const { signIn, signOut } = require("../controllers/sessionController");

//const isAuthenticated = require("../middlewares/isAuthenticated");

dotenv.config();

// SSO
// routes.get(["/", "/idp", "/saml/sso"], parseSamlRequest);
routes.post(["/", "/idp", "/saml/sso"], parseSamlRequest);

// SLO
routes.get("/saml/slo", parseLogoutRequest);
routes.post("/saml/slo", parseLogoutRequest);

// Sign In Route (takes signed message from keepkey and validates against rbac
routes.post("/saml/signIn", signIn);

// Sign Out request
routes.get("/saml/signOut", signOut);

routes.get("/", (req, res) => res.json({ msg: "SAML IDP" }));

module.exports = routes;
