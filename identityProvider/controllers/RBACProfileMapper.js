//shorthands claims namespaces
var fm = {
  'nameIdentifier': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  'email': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  'name': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  'account': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/account',
  'givenname': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
  'surname': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
  'upn': 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn',
  'groups': 'http://schemas.xmlsoap.org/claims/Group'
};

/**
 *
 * RBAC User Profile Mapper
 *
 * A class to map data from a RBAC to a wsfed claims based identity.
 *
 * Claim Types:
 * http://msdn.microsoft.com/en-us/library/microsoft.identitymodel.claims.claimtypes_members.aspx
 * 
 * @param  {Object} pu RBAC.js user profile
 */
function RBACProfileMapper (pu) {
  if(!(this instanceof RBACProfileMapper)) {
    return new RBACProfileMapper(pu);
  }
  this._rbacUser = pu;
}

/**
 * map rbac user profile to a wsfed claims based identity.
 * 
 * @return {Object}    WsFederation claim identity
 */
RBACProfileMapper.prototype.getClaims = function () {
  var claims = {};

  claims[fm.nameIdentifier]  = this._rbacUser.account;
  claims[fm.email]      = this._rbacUser.email;
  claims[fm.name]       = this._rbacUser.displayName;
  claims[fm.city]       = this._rbacUser.city;
  claims[fm.groups]     = this._rbacUser.groups;
  
  var dontRemapAttributes = ['email', 'displayName', 'name', 'account', 'city', '_json'];

  Object.keys(this._rbacUser).filter(function (k) {
      return !~dontRemapAttributes.indexOf(k);
    }).forEach(function (k) {
      claims['http://changeThisLater.com/' + k] = this._rbacUser[k];
    }.bind(this));

  return claims;
};

/**
 * returns the nameidentifier for the saml token.
 * 
 * @return {Object} object containing a nameIdentifier property and optional nameIdentifierFormat.
 */
RBACProfileMapper.prototype.getNameIdentifier = function () {
  var claims = this.getClaims();

  return {
    nameIdentifier: claims[fm.nameIdentifier] ||
                    claims[fm.name] ||
                    claims[fm.emailaddress]
  };

};

/**
 * claims metadata used in the metadata endpoint.
 * 
 * @param  {Object} pu RBAC.js profile
 * @return {[type]}    WsFederation claim identity
 */
RBACProfileMapper.prototype.metadata = [ {
  id: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  optional: true,
  displayName: 'E-Mail Address',
  description: 'The e-mail address of the user'
}, {
  id: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
  optional: true,
  displayName: 'Given Name',
  description: 'The given name of the user'
}, {
  id: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
  optional: true,
  displayName: 'Name',
  description: 'The unique name of the user'
}, {
  id: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
  optional: true,
  displayName: 'Surname',
  description: 'The surname of the user'
}, {
  id: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
  optional: true,
  displayName: 'Name ID',
  description: 'The SAML name identifier of the user'
}];

module.exports = RBACProfileMapper;
