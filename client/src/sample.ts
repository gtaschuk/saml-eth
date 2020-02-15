import $ from 'jquery'
import * as debug from 'debug'
import {
  Keyring,
  supportsETH,
  supportsBTC,
  supportsCosmos,
  supportsDebugLink,
  bip32ToAddressNList,
  Events
} from '@shapeshiftoss/hdwallet-core'

import { isKeepKey } from '@shapeshiftoss/hdwallet-keepkey'
import { isPortis } from '@shapeshiftoss/hdwallet-portis'

import { WebUSBKeepKeyAdapter } from '@shapeshiftoss/hdwallet-keepkey-webusb'
import { TCPKeepKeyAdapter } from '@shapeshiftoss/hdwallet-keepkey-tcp'
import { TrezorAdapter } from '@shapeshiftoss/hdwallet-trezor-connect'
import { WebUSBLedgerAdapter } from '@shapeshiftoss/hdwallet-ledger-webusb'
import { PortisAdapter } from '@shapeshiftoss/hdwallet-portis'

import {
  BTCInputScriptType,
  BTCOutputScriptType,
  BTCOutputAddressType,
} from '@shapeshiftoss/hdwallet-core/src/bitcoin'

import * as btcBech32TxJson from './json/btcBech32Tx.json'
import * as btcTxJson from './json/btcTx.json'
import * as btcSegWitTxJson from './json/btcSegWitTx.json'
import * as dashTxJson from './json/dashTx.json'
import * as dogeTxJson from './json/dogeTx.json'
import * as ltcTxJson from './json/ltcTx.json'

const keyring = new Keyring()


const keepkeyAdapter = WebUSBKeepKeyAdapter.useKeyring(keyring)
//const kkemuAdapter = TCPKeepKeyAdapter.useKeyring(keyring)

const log = debug.default('hdwallet')

keyring.onAny((name: string[], ...values: any[]) => {
  const [[ deviceId, event ]] = values
  const { from_wallet = false, message_type } = event
  let direction = from_wallet ? "🔑" : "💻"
  debug.default(deviceId)(`${direction} ${message_type}`, event)
})

window['keyring'] = keyring

window.localStorage.debug = '*'
const loggers: {[deviceID: string]: debug.Debugger} = {}

let wallet
window['wallet'] = wallet

const $keepkey = $('#keepkey')
const $keyring = $('#keyring')

$keepkey.on('click', async (e) => {
  e.preventDefault()
  wallet = await keepkeyAdapter.pairDevice(undefined, /*tryDebugLink=*/true)
  listen(wallet.transport)
  window['wallet'] = wallet
  $('#keyring select').val(wallet.transport.getDeviceID())
})

async function deviceConnected (deviceId) {
  let wallet = keyring.get(deviceId)
  if (!$keyring.find(`option[value="${deviceId}"]`).length) {
    $keyring.append(
      $("<option></option>")
        .attr("value", deviceId)
        .text(deviceId + ' - ' + await wallet.getVendor())
    )
  }
}

(async () => {
  try {
    await keepkeyAdapter.initialize(undefined, /*tryDebugLink=*/true, /*autoConnect=*/false)
  } catch (e) {
    console.error('Could not initialize KeepKeyAdapter', e)
  }

  for (const [deviceID, wallet] of Object.entries(keyring.wallets)) {
    await deviceConnected(deviceID)
  }
  $keyring.change(async (e) => {
    if (wallet) {
      await wallet.disconnect()
    }
    let deviceID = $keyring.find(':selected').val() as string
    wallet = keyring.get(deviceID)
    if (wallet) {
      await wallet.transport.connect()
      if (isKeepKey(wallet)) {
        console.log("try connect debuglink")
        await wallet.transport.tryConnectDebugLink()
      }
      await wallet.initialize()
    }
    window['wallet'] = wallet
  })
  wallet = keyring.get()
  window['wallet'] = wallet
  if (wallet) {
    let deviceID = wallet.getDeviceID()
    $keyring.val(deviceID).change()
  }

  keyring.on(['*', '*', Events.CONNECT], async (deviceId) => {
    await deviceConnected(deviceId)
  })

  keyring.on(['*', '*', Events.DISCONNECT], async (deviceId) => {
    $keyring.find(`option[value="${deviceId}"]`).remove()
  })
})()

window['handlePinDigit'] = function (digit) {
  let input = document.getElementById('#pinInput')
  if (digit === "") {
    input.value = input.value.slice(0, -1);
  } else {
    input.value += digit.toString();
  }
}

window['pinOpen'] = function () {
  document.getElementById('#pinModal').className = 'modale opened'
}

window['pinEntered'] = function () {
  let input = document.getElementById('#pinInput')
  wallet.sendPin(input.value);
  document.getElementById('#pinModal').className='modale';
}

//window['passphraseOpen'] = function () {
  //document.getElementById('#passphraseModal').className = 'modale opened'
//}

//window['passphraseEntered'] = function () {
  //let input = document.getElementById('#passphraseInput')
  //wallet.sendPassphrase(input.value);
  //document.getElementById('#passphraseModal').className='modale';
//}

function listen(transport) {
  if (!transport)
    return

  transport.on(Events.PIN_REQUEST, e => {
    window['pinOpen']()
  })

  //transport.on(Events.PASSPHRASE_REQUEST, e => {
    //window['passphraseOpen']()
  //})
}

const $yes = $('#yes')
const $no = $('#no')
const $cancel = $('#cancel')

$yes.on('click', async (e) => {
  e.preventDefault()
  if (!wallet)
    return

  if (!supportsDebugLink(wallet))
    return

  await wallet.pressYes()
})

$no.on('click', async (e) => {
  e.preventDefault()
  if (!wallet)
    return

  if (!supportsDebugLink(wallet))
    return

  await wallet.pressNo()
})

$cancel.on('click', async (e) => {
  e.preventDefault()

  if (!wallet)
    return

  await wallet.cancel()
})

const $getVendor = $('#getVendor')
const $getModel = $('#getModel')
const $getDeviceID = $('#getDeviceID')
const $getFirmware = $('#getFirmware')
const $getLabel = $('#getLabel')
const $getXpubs = $('#getXpubs')
const $doPing = $('#doPing')
const $doWipe = $('#doWipe')
const $doLoadDevice = $('#doLoadDevice')
const $manageResults = $('#manageResults')

$getVendor.on('click', async (e) => {
  e.preventDefault()
  if (!wallet) { $manageResults.val("No wallet?"); return}
  let vendor = await wallet.getVendor()
  $manageResults.val(vendor)
})

$getModel.on('click', async (e) => {
  e.preventDefault()
  if (!wallet) { $manageResults.val("No wallet?"); return}
  let model = await wallet.getModel()
  $manageResults.val(model)
})

$getDeviceID.on('click', async (e) => {
  e.preventDefault()
  if (!wallet) { $manageResults.val("No wallet?"); return}
  let deviceID = await wallet.getDeviceID()
  $manageResults.val(deviceID)
})

$getFirmware.on('click', async (e) => {
  e.preventDefault()
  if (!wallet) { $manageResults.val("No wallet?"); return}
  let firmware = await wallet.getFirmwareVersion()
  $manageResults.val(firmware)
})

$getLabel.on('click', async (e) => {
  e.preventDefault()
  if (!wallet) { $manageResults.val("No wallet?"); return}
  let label = await wallet.getLabel()
  $manageResults.val(label)
})

$getXpubs.on('click', async (e) => {
  e.preventDefault()

  if (!wallet) { $manageResults.val("No wallet?"); return}

  // Get Ethereum path
  const { hardenedPath } = wallet.ethGetAccountPaths({coin: "Ethereum", accountIdx: 0})[0]

  const result = await wallet.getPublicKeys([
    {
      addressNList: hardenedPath,
      curve: "secp256k1",
      showDisplay: true, // Not supported by TrezorConnect or Ledger, but KeepKey should do it
      coin: "Ethereum"
    }
  ])

  $manageResults.val(JSON.stringify(result))
})

$doPing.on('click', async (e) => {
  e.preventDefault()
  if (!wallet) { $manageResults.val("No wallet?"); return }
  const result = await wallet.ping({ msg: "Hello World", button: true })
  $manageResults.val(result.msg)
})

$doWipe.on('click', (e) => {
  e.preventDefault()
  if (!wallet) { $manageResults.val("No wallet?"); return}
  wallet.wipe()
})

$doLoadDevice.on('click', (e) => {
  e.preventDefault()
  if (!wallet) { $manageResults.val("No wallet?"); return}
  wallet.loadDevice({ mnemonic: /*trezor test seed:*/'alcohol woman abuse must during monitor noble actual mixed trade anger aisle' })
})

const $openApp = $('#openApp')
const $ledgerApp = $('#ledgerApp')
const $validateApp = $('#validateApp')
const $appSymbol = $('#appSymbol')
const $getAppInfo = $('#getAppInfo')
const $appInfo = $('#appInfo')

$ledgerApp.attr("placeholder", "App name i.e. Bitcoin Cash")
$appSymbol.attr("placeholder", "App symbol i.e. BCH")

$openApp.on('click', async (e) => {
  e.preventDefault()
  if (!wallet) { $ledgerApp.val("No wallet?"); return}
  const appName = $('#ledgerApp').val()
  if (!appName) { $ledgerApp.val("Please enter app name here"); return}
  let result
  try {
    await wallet.openApp(appName)
    result = "Check device for prompt"
  } catch (err) {
    console.error(err)
    result = err.message
  }
  $ledgerApp.val(result)
})

$validateApp.on('click', async (e) => {
  e.preventDefault()
  if (!wallet) { $appSymbol.val("No wallet?"); return}
  const appSymbol = $('#appSymbol').val()
  if (!appSymbol) { $appSymbol.val("Please enter app symbol here"); return}
  let result
  try {
    await wallet.validateCurrentApp(appSymbol)
    result = 'Correct app open'
  } catch (err) {
    console.error(err)
    result = err.message
  }
  $appSymbol.val(result)
})

$getAppInfo.on('click', async (e) => {
  e.preventDefault()
  if (!wallet) { $appInfo.val("No wallet?"); return}
  let result
  try {
    const res = await wallet.transport.call(null, 'getAppAndVersion')
    result = res.payload.name
  } catch (err) {
    console.error(err)
    result = err.message
  }
  $appInfo.val(result)
})

/*
      Ethereum
        * segwit: false
        * mutltisig: false
        * Bech32: false

*/
const $ethAddr = $('#ethAddr')
const $ethTx = $('#ethTx')
const $ethSign = $('#ethSign')
const $ethVerify = $('#ethVerify')
const $ethResults = $('#ethResults')

$ethAddr.on('click', async (e) => {
  e.preventDefault()
  if (!wallet) { $ethResults.val("No wallet?"); return}
  if (supportsETH(wallet)) {
    let { hardenedPath, relPath } = wallet.ethGetAccountPaths({ coin: "Ethereum", accountIdx: 0 })[0]
    let result = await wallet.ethGetAddress({
      addressNList: hardenedPath.concat(relPath),
      showDisplay: false
    })
    result = await wallet.ethGetAddress({
      addressNList: hardenedPath.concat(relPath),
      showDisplay: true,
      address: result
    })
    $ethResults.val(result)
  } else {
    let label = await wallet.getLabel()
    $ethResults.val(label + " does not support ETH")
  }
})

$ethTx.on('click', async (e) => {
  e.preventDefault()
  if (!wallet) { $ethResults.val("No wallet?"); return}
  if (supportsETH(wallet)) {
    let res = await wallet.ethSignTx({
      addressNList: bip32ToAddressNList("m/44'/60'/0'/0/0"),
      nonce: "0x0",
      gasPrice: "0x5FB9ACA00",
      gasLimit: "0x186A0",
      value: '0x00',
      to: "0x41e5560054824ea6b0732e656e3ad64e20e94e45",
      chainId: 1,
      data: '0x' + 'a9059cbb000000000000000000000000' + '9BB9E5bb9b04e8CE993104309A1f180feBf63DB6' + '0000000000000000000000000000000000000000000000000000000005F5E100',
    })
    $ethResults.val(JSON.stringify(res))
  } else {
    let label = await wallet.getLabel()
    $ethResults.val(label + " does not support ETH")
  }
})

$ethSign.on('click', async (e) => {
  e.preventDefault()
  if (!wallet) { $ethResults.val("No wallet?"); return}
  if (supportsETH(wallet)) {
    let { hardenedPath: hard, relPath: rel } = wallet.ethGetAccountPaths({ coin: "Ethereum", accountIdx: 0 })[0]
    let result = await wallet.ethSignMessage({ addressNList: hard.concat(rel), message: "Hello World" })
    $ethResults.val(result.address + ', ' + result.signature)
  } else {
    let label = await wallet.getLabel()
    $ethResults.val(label + " does not support ETH")
  }
})

$ethVerify.on('click', async (e) => {
  e.preventDefault()
  if (!wallet) { $ethResults.val("No wallet?"); return}
  if (supportsETH(wallet)) {
    let result = await wallet.ethVerifyMessage({
      address: "0x2068dD92B6690255553141Dfcf00dF308281f763",
      message: "Hello World",
      signature: "61f1dda82e9c3800e960894396c9ce8164fd1526fccb136c71b88442405f7d09721725629915d10bc7cecfca2818fe76bc5816ed96a1b0cebee9b03b052980131b"
    })
    $ethResults.val(result ? '✅' : '❌')
  } else {
    let label = await wallet.getLabel()
    $ethResults.val(label + " does not support ETH")
  }
})
