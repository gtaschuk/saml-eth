import React, { useEffect, useState } from "react";
import { Events, Keyring } from "@shapeshiftoss/hdwallet-core";
import { WebUSBKeepKeyAdapter } from "@shapeshiftoss/hdwallet-keepkey-webusb";

const keyring = new Keyring();
const keepkeyAdapter = WebUSBKeepKeyAdapter.useKeyring(keyring);

export const HdWalletSetup = () => {
  const [keepKeyAddress, setKeepKeyAddress] = useState(null);
  const [ethMessage, setEthMessage] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [stateWallet, setStateWallet] = useState(null);
  const [pinDigits, setSetPinDigits] = useState("");

  useEffect(() => {
    const initializeKeyKey = async () => {
      await keepkeyAdapter.initialize(undefined, true, false);
      let wallet = keyring.get(keepKeyAddress);

      await wallet.transport.connect();
      await wallet.transport.tryConnectDebugLink();
      await wallet.initialize();

      wallet = keyring.get();
      window["wallet"] = wallet;
      setStateWallet(wallet);
    };
    initializeKeyKey();
  }, [setShowPinModal, keepKeyAddress, setKeepKeyAddress]);

  const handleKeepKeyClick = async e => {
    e.preventDefault();
    let wallet = await keepkeyAdapter.pairDevice(undefined, true);
    wallet.transport.on(Events.PIN_REQUEST, e => setShowPinModal(true));
    window["wallet"] = wallet;
    setStateWallet(wallet);
    setKeepKeyAddress(await wallet.getDeviceID());
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
      const info = {
        addressNList: hard.concat(rel),
        message: "YOOOO"
      };
      let result = await stateWallet.ethSignMessage(info);
      setEthMessage(result.address + ", " + result.signature);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePinDigit = digit => {
    if (digit === "") {
      setSetPinDigits(pinDigits.slice(0, -1));
    } else {
      setSetPinDigits(pinDigits.concat(digit));
    }
  };

  const pinEntered = () => {
    stateWallet.sendPin(pinDigits);
  };
  return (
    <div>
      <button type="button" onClick={handleKeepKeyClick}>
        connect keep key
      </button>
      <p>your keep key address is: {keepKeyAddress}</p>
      <button type="button" onClick={signMessage}>
        sign message
      </button>
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
                7
              </button>
              <button
                onClick={() => handlePinDigit("8")}
                className="button button-outline"
              >
                8
              </button>
              <button
                onClick={() => handlePinDigit("9")}
                className="button button-outline"
              >
                9
              </button>
              <button
                onClick={() => handlePinDigit("4")}
                className="button button-outline"
              >
                4
              </button>
              <button
                onClick={() => handlePinDigit("5")}
                className="button button-outline"
              >
                5
              </button>
              <button
                onClick={() => handlePinDigit("6")}
                className="button button-outline"
              >
                6
              </button>
              <button
                onClick={() => handlePinDigit("1")}
                className="button button-outline"
              >
                1
              </button>
              <button
                onClick={() => handlePinDigit("2")}
                className="button button-outline"
              >
                2
              </button>
              <button
                onClick={() => handlePinDigit("3")}
                className="button button-outline"
              >
                3
              </button>
              <input readOnly id="#pinInput" type="text" value={pinDigits} />
              <button
                onClick={() => handlePinDigit("")}
                className="button button-outline"
              >
                x
              </button>
            </div>
            <div className="modal-footer">
              <button className="button button-outline" onClick={pinEntered}>
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
