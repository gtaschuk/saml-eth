import React from "react";
import { Route, BrowserRouter } from "react-router-dom";
import { HdWalletSetup } from "./HdWallet";

const LandingPage = () => {
  return (
    <div style={{width: '50%', margin: 'auto', padding: 10, backgroundColor: 'white'}}>
      <h2>Connect your hardware wallet to log in</h2>
      <HdWalletSetup />
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Route exact path="/saml/sso" component={LandingPage} />
    </BrowserRouter>
  );
};

export default App;
