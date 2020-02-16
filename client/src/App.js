import React from "react";
import { Route, BrowserRouter } from "react-router-dom";
import { LandingPage } from "./LandingPage";
import './app.css'; // Tell Webpack that Button.js uses these styles


const App = () => {
  return (
    <BrowserRouter>
      <Route exact path="/saml/sso" component={LandingPage} />
    </BrowserRouter>
  );
};

export default App;
