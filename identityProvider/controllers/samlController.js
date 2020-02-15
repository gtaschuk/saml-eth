import samlp from 'samlp'

const showUser = function (req, res, next) {
  res.render('user', {
    user: req.user,
    participant: req.participant,
    metadata: req.metadata,
    authnRequest: req.authnRequest,
    idp: req.idp.options,
    paths: IDP_PATHS
  });
}

export const parseSamlRequest = (req, res, next) => {
  samlp.parseRequest(req, function(err, data) {
    if (err) {
      return res.render('error', {
        message: 'SAML AuthnRequest Parse Error: ' + err.message,
        error: err
      });
    };
    if (data) {
      req.authnRequest = {
        relayState: req.query.RelayState || req.body.RelayState,
        id: data.id,
        issuer: data.issuer,
        destination: data.destination,
        acsUrl: data.assertionConsumerServiceURL,
        forceAuthn: data.forceAuthn === 'true'
      };
      console.log('Received AuthnRequest => \n', req.authnRequest);
    }
    return showUser(req, res, next);
  })
  // Parse saml request using samlp and return user

}

export const parseLogoutRequest = (req, res, next) => {
  // destroy IDP session for a user
}
