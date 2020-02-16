import React, { useState } from "react";
import { Route, BrowserRouter } from "react-router-dom";
import axios from "axios";
import { HDWallet } from "@shapeshiftoss/hdwallet-core";
import { isKeepKey, KeepKeyHDWallet } from "@shapeshiftoss/hdwallet-keepkey";
import { WebUSBKeepKeyAdapter } from "@shapeshiftoss/hdwallet-keepkey-webusb";
import { Keyring } from "@shapeshiftoss/hdwallet-core";
import { HdWalletSetup } from "./HdWallet";
const keyring = new Keyring();

const keepkeyAdapter = WebUSBKeepKeyAdapter.useKeyring(keyring);

const client = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:8080"
});

const LandingPage = () => {
  const [message, setMessage] = useState(null);

  return (
    <div>
      <HdWalletSetup />
      <button
        type="button"
        onClick={async () => {
          const {
            data: { msg: message }
          } = await client.get("/");
          setMessage(message);
        }}
      >
        Say hello to the server
      </button>
      <p>{message}</p>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Route exact path="/" component={LandingPage} />
    </BrowserRouter>
  );
};

export default App;
