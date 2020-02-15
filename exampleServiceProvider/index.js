var saml2 = require('saml2-js');
var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
 
// Create service provider
var sp_options = {
  entity_id: "http://localhost:3000/metadata.xml",
  private_key: fs.readFileSync("test-sp-cert.key").toString(),
  certificate: fs.readFileSync("test-sp-cert.pem").toString(),
  assert_endpoint: "http://localhost:3000/assert"
};
var sp = new saml2.ServiceProvider(sp_options);
 
// Create identity provider
var idp_options = {
  //sso_login_url: "http://localhost:4000/saml/signIn",
  //sso_logout_url: "http://localhost:4000/saml/signOut",
  sso_login_url: "http://localhost:8080/saml/sso",
  sso_logout_url: "http://localhost:8080/saml/slo",
  certificates: [fs.readFileSync("test-idp-cert.pem").toString()]
};
var idp = new saml2.IdentityProvider(idp_options);
 
// ------ Define express endpoints ------
 
// Endpoint to retrieve metadata
app.get("/metadata.xml", function(req, res) {
  res.type('application/xml');
  res.send(sp.create_metadata());
});
 
// Starting point for login
app.get("/login", function(req, res) {
  sp.create_login_request_url(idp, {}, function(err, login_url, request_id) {
    if (err != null)
      return res.send(500);
    res.redirect(login_url);
  });
});
 
// Assert endpoint for when login completes
app.post("/assert", function(req, res) {
  var options = {request_body: req.body};
  sp.post_assert(idp, options, function(err, saml_response) {
    if (err != null)
      return res.send(500);
 
    // Save name_id and session_index for logout
    // Note:  In practice these should be saved in the user session, not globally.
    name_id = saml_response.user.name_id;
    session_index = saml_response.user.session_index;
 
    res.send("Hello #{saml_response.user.name_id}!");
  });
});
 
// Starting point for logout
app.get("/logout", function(req, res) {
  var options = {
    name_id: name_id,
    session_index: session_index
  };
 
  sp.create_logout_request_url(idp, options, function(err, logout_url) {
    if (err != null)
      return res.send(500);
    res.redirect(logout_url);
  });
});


app.get("/", function(req, res) {
  res.send("<h1>Service Provider</h1><a href='/login'>>> Click Here to Login <<</a>");
})
 
app.listen(3000);
