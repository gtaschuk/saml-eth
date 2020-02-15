import React, { useEffect, useState, Fragment } from "react";
import { useLocation} from 'react-router-dom'
import { Events, Keyring } from "@shapeshiftoss/hdwallet-core";
import { WebUSBKeepKeyAdapter } from "@shapeshiftoss/hdwallet-keepkey-webusb";
import axios from "axios";

const client = axios.create({
  //withCredentials: true,
  baseURL: "http://localhost:8080"
});

const keyring = new Keyring();
const keepkeyAdapter = WebUSBKeepKeyAdapter.useKeyring(keyring);
window['keyring'] = keyring

keyring.onAny((name, ...values) => {
  const [[ deviceId, event ]] = values
  const { from_wallet = false, message_type } = event
  let direction = from_wallet ? "🔑" : "💻"
  console.log(deviceId, `${direction} ${message_type}`, event)
})

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const HdWalletSetup = () => {
  let query = useQuery()
  const qp = query.get('SAMLRequest')
  console.log(qp)

  const [keepKeyDeviceID, setKeepKeyDeviceID] = useState(null);
  const [ethMessage, setEthMessage] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [stateWallet, setStateWallet] = useState(null);
  const [pinDigits, setPinDigits] = useState("");
  const [assertForm, setAssertForm] = useState("");

  useEffect(() => {
    const initializeKeyKey = async () => {
      await keepkeyAdapter.initialize(undefined, true, false);
      if (!keepKeyDeviceID) { console.log("DONT HAVE DEVICE ID"); return }
      let wallet = keyring.get(keepKeyDeviceID);

      await wallet.transport.connect();
      await wallet.transport.tryConnectDebugLink();
      await wallet.initialize();

      wallet = keyring.get(); // should this be device ID
      window["wallet"] = wallet;
      setStateWallet(wallet);
    };
    initializeKeyKey();
  }, [setShowPinModal, keepKeyDeviceID, setKeepKeyDeviceID]);

  const handleKeepKeyClick = async e => {
    e.preventDefault();
    let wallet = await keepkeyAdapter.pairDevice(undefined, true);

    // listen function
    wallet.transport.on(Events.PIN_REQUEST, e => setShowPinModal(true));

    window["wallet"] = wallet;
    setStateWallet(wallet);
    setKeepKeyDeviceID(await wallet.getDeviceID());
  };

  const signMessage = async e => {
    e.preventDefault();
    if (!stateWallet) {
      setEthMessage("Connect your keep key wallet");
      return;
    }

    let { hardenedPath: hard, relPath: rel } = stateWallet.ethGetAccountPaths({
      coin: "Ethereum",
      accountIdx: 0
    })[0];
    try {
      const message = "Signing into Identity Provider"
      const info = {
        addressNList: hard.concat(rel),
        message
      };
      let result = await stateWallet.ethSignMessage(info);
      setEthMessage(result.address + ", " + result.signature);
      console.log(result)
      const { signature, address } = result
      const samlRequest = query.get('SAMLRequest')

      const data = {address, message, signature, samlRequest}
      console.log(data)

      await client.post("/saml/signIn", data)
        .then(response => {
          console.log("RESULT", response)
          setAssertForm(response.data)
          document.getElementsByName('hiddenform')[0].submit()
        }, (error) => {
          console.log("ERROR", error)
        })
      // TODO handle error here
    } catch (error) {
      console.log(error);
    }
  };

  const handlePinDigit = digit => {
    if (digit === "") {
      setPinDigits(pinDigits.slice(0, -1));
    } else {
      setPinDigits(pinDigits.concat(digit));
    }
  };

  const pinEntered = () => {
    stateWallet.sendPin(pinDigits);
  };

  return (
    <div>
      <button type="button" onClick={handleKeepKeyClick}>
        Connect keep key
      </button>
      { Boolean(keepKeyDeviceID) && 
      <Fragment>
        <p>Your keep key address is: {keepKeyDeviceID}</p>
        <button type="button" onClick={signMessage}>
          Sign message
        </button>
      </Fragment>
      }
      <p>{ethMessage}</p>
      {showPinModal && (
        <div id="#pinModal" className="modale opened">
          <div className="modal-diaslog">
            <div className="modal-header">
              <h3>Enter PIN</h3>
              <p>
                Use the PIN layout shown on your device to find the location to
                press on this PIN pad.
              </p>
            </div>
            <div className="modal-body">
              <button
                onClick={() => handlePinDigit("7")}
                className="button button-outline"
              >
                  &#x25CF;
              </button>
              <button
                onClick={() => handlePinDigit("8")}
                className="button button-outline"
              >
                  &#x25CF;
              </button>
              <button
                onClick={() => handlePinDigit("9")}
                className="button button-outline"
              >
                  &#x25CF;
              </button>
              <br/>
              <button
                onClick={() => handlePinDigit("4")}
                className="button button-outline"
              >
                  &#x25CF;
              </button>
              <button
                onClick={() => handlePinDigit("5")}
                className="button button-outline"
              >
                  &#x25CF;
              </button>
              <button
                onClick={() => handlePinDigit("6")}
                className="button button-outline"
              >
                  &#x25CF;
              </button>
              <br/>
              <button
                onClick={() => handlePinDigit("1")}
                className="button button-outline"
              >
                  &#x25CF;
              </button>
              <button
                onClick={() => handlePinDigit("2")}
                className="button button-outline"
              >
                  &#x25CF;
              </button>
              <button
                onClick={() => handlePinDigit("3")}
                className="button button-outline"
              >
                  &#x25CF;
              </button>
              <br/>
              <button
                onClick={() => handlePinDigit("")}
                className="button button-outline"
              >
                x
              </button>
            </div>
            <input readOnly id="#pinInput" type="password" value={pinDigits} />
            <div className="modal-footer">
              <button className="button button-outline" onClick={pinEntered}>
                Unlock
              </button>
            </div>
            <div dangerouslySetInnerHTML={{__html: assertForm}} />
          </div>
        </div>
      )}
    </div>
  );
};
