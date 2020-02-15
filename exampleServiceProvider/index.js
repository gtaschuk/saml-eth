var saml2 = require('saml2-js');
var fs = require('fs');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var samlp = require('samlp')
var zlib = require('zlib')
var Parser = require('xmldom').DOMParser

app.use(bodyParser.urlencoded({
  extended: true
}));

// Globals
let name_id, session_index
 
// Create service provider
var sp_options = {
  entity_id: "http://localhost:5000/metadata.xml",
  private_key: fs.readFileSync("test-sp-cert.key").toString(),
  certificate: fs.readFileSync("test-sp-cert.pem").toString(),
  assert_endpoint: "http://localhost:5000/assert"
};
var sp = new saml2.ServiceProvider(sp_options);
 
// Create identity provider
var idp_options = {
  //sso_login_url: "http://localhost:4000/saml/signIn",
  //sso_logout_url: "http://localhost:4000/saml/signOut",
  sso_login_url: "http://localhost:3000/saml/sso",
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
      return res.sendStatus(500);
    res.redirect(login_url);
  });
});
 
// Assert endpoint for when login completes
app.post("/assert", function(req, res) {
  var options = {request_body: req.body};
 
  const samlResponseParam = req.body['SAMLResponse']
  let buffer = Buffer.from(samlResponseParam, 'base64');
  let doc = new Parser().parseFromString(buffer.toString('utf8'))
  name_id = doc.getElementsByTagName('saml:NameID')[0].firstChild.data
  res.send("Hi " + name_id + '\nSAML Response\n' + buffer.toString('utf8'));
});
 
// Starting point for logout
app.get("/logout", function(req, res) {
  var options = {
    name_id: name_id,
    session_index: session_index
  };
 
  sp.create_logout_request_url(idp, options, function(err, logout_url) {
    if (err != null)
      return res.sendStatus(500);
    res.redirect(logout_url);
  });
});

app.get("/protected", function(req, res) {
  if (name_id) {
    res.send("It worked #{name_id}")
  } else {
    res.send("You are not logged in")
  }
});



app.get("/", function(req, res) {
  res.send("<h1>Service Provider</h1><a href='/login'>>> Click Here to Login <<</a>");
})
 
app.listen(5000);
