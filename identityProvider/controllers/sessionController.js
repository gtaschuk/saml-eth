import Web3 from 'web3'
import samlp from 'samlp'
import { rbacAbi } from "../abis/rbacAbi";
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import {parseString} from 'xml2js'
import RBACProfileMapper from './RBACProfileMapper'
import Box from '3box'


const rbacContractAddress = process.env.REACT_APP_RBAC_ADDRESS || "0xb61752bb7c6e865037995334848276b53c4688c8";

const samlSignIn = (req, res, next, authnRequest, address) => {
  let authOptions = {}
  // Apply AuthnRequest Params
  authOptions.inResponseTo = authnRequest.ID;
  const acsUrl = authnRequest.AssertionConsumerServiceURL

  // TODO Not needed?
  if (req.idp && req.idp.options.allowRequestAcsUrl && acsUrl) {
    authOptions.acsUrl = acsUrl;
    authOptions.recipient = acsUrl;
    authOptions.destination = acsUrl;
    authOptions.forceAuthn = authnRequest.forceAuthn;
  }
  if (authnRequest.relayState) {
    authOptions.RelayState = req.authnRequest.relayState;
  }

  samlp.auth({
    issuer: 'saml-eth',
    cert: fs.readFileSync(path.join(__dirname, 'test-cert.pem')),
    key: fs.readFileSync(path.join(__dirname, 'test-cert.key')),
    getPostURL: (wtrealm, wreply, req, callback) => {
      const callbackURL = 'http://localhost:5000/assert'
      return callback( null, callbackURL)
    },
    getUserFromRequest: (req) => {
      return req.user
    },
    profileMapper: RBACProfileMapper
  })(req, res, (err) => {
    console.log("in next block")
    if (err) {
      return res.send(400, err.message);
    } 
    next();
  })
}

export const signIn = (req, res, next) => {

  const web3Eth = new Web3('http://localhost:8545').eth

  //const signatureObject = {
    //message: 'Some data',
    //messageHash: '0x1da44b586eb0729ff70a73c326926f6ed5a25f5b056e7f47fbc6e58d86871655',
    //v: '0x1c',
    //r: '0xb91467e570a6466aa9e9876cbcd013baba02900b8979d43fe208a4a4f339f5fd',
    //s: '0x6007e74cd82e037b800186422fc2da167c747ef045e5d18a5f5d4300f8e1a029',
    //signature: '0xb91467e570a6466aa9e9876cbcd013baba02900b8979d43fe208a4a4f339f5fd6007e74cd82e037b800186422fc2da167c747ef045e5d18a5f5d4300f8e1a0291c'
  //} 

  //const { message, signature } = signatureObject
  const { message, signature } = req.body


  const account = web3Eth.accounts.recover(message, signature)

  //console.log("Here", account)
  const transactionParameters = {}
  const rbacContract = new web3Eth.Contract(
    rbacAbi,
    rbacContractAddress,
    transactionParameters
  );

  rbacContract.methods.userExists(account).call({}, async (err, userExists) => {
    console.log("USER EXISTS", userExists, account)
    if (userExists) {
      const samlRequestParam = req.body['samlRequest']
      let buffer = Buffer.from(samlRequestParam, 'base64');
      zlib.inflateRaw(buffer, (error, inflated) => {
        //console.log(inflated.toString('utf8'))

        parseString(inflated.toString('utf8'), async (err, result) => {
          const authnRequest = result['AuthnRequest']['$']

          // Get data from 3Box
          const profile = Box.getProfile(account)
          const displayName = profile.name
          const email = profile.email
          const city = profile.location
          const session_index = authnRequest.ID

          const rbacRoles = await rbacContract.methods.getUserRoleBitmask(account).call()
          console.log(rbacRoles)

          let groups = []
          if (rbacRoles & 1) {
            groups.push('rbac_admin')
          }
          if (rbacRoles & 2) {
            groups.push('employee')
          }
          if (rbacRoles & 4) {
            groups.push('hr')
          }
          if (rbacRoles & 8) {
            groups.push('ceo')
          }
          req.user = {account, displayName, groups, session_index, email, city}
          console.log(req.user)
          samlSignIn(req, res, authnRequest, account)
        })
      })
    } else {
      // return an error message
      res.status(401).end()
      //samlSignIn(req, res, {}, account)
    }
  })
}

// Optional method to sign out of a particular service
export const signOut = (req, res, next) => {
  // Redirect user to service provider sign out if available
  if (req.idp.options.sloUrl) {
    console.log('Initiating SAML SLO request for user: ' + req.user.userName +
      ' with sessionIndex: ' + getSessionIndex(req));
    res.redirect(IDP_PATHS.SLO);
  } else {
    console.log('SAML SLO is not enabled for SP, destroying IDP session');
    req.session.destroy(function(err) {
      if (err) {
        throw err;
      }
      res.redirect('back');
    })
  }
}
