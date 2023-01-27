Isolate vega keys and use isolated key in the nodewallet
========================================================

Note:
> I'm going to do all the steps from generating a wallet to importing it, you may want to reuse your existing wallets

First let's generate a new wallet with the following command:
```
vega wallet key generate --wallet="testnet-jeremy"
```

This should give you a similar ouptut to:
```
➜  code.vegaprotocol.io vega wallet key generate --wallet="testnet-jeremy"
✗ You are running an unreleased version of the Vega wallet. Use it at your own risk!

Enter passphrase:
Confirm passphrase:

! Wallet testnet-jeremy does not exist yet
✓ Wallet testnet-jeremy has been created at: /Users/jeremy/Library/Application Support/vega/wallets/testnet-jeremy
✓ Key pair has been generated for wallet testnet-jeremy at: /Users/jeremy/Library/Application Support/vega/wallets/testnet-jeremy
✓ Generating a key pair succeeded

Wallet mnemonic:
wood cover peace oblige night arrange canvas cook valid siege hurry happy lemon buffalo floor unit dry stem marine hidden feature found slab wonder
Public key:
f7ac359bb8ec752ad91dd94fcf6bede86b021d60859576253eca5a7cf63e86dd
Metadata:
name | testnet-jeremy key 1

➜ Important
1. Write down the mnemonic and store it somewhere safe and secure, now, as it will not be displayed ever again!
2. Do not share the mnemonic nor the private key.

➜ Run the service
Once you have a key pair generated, you can run the service with the following command:

    $ wallet service run

If you want to open up a local version of Vega Console alongside the service, use the following command:

    $ wallet service run --console-proxy

To terminate the process, hit ctrl+c

For more information, use --help flag.
```

Here, let's take note of the pubkey, which is the one that we will want to isolate (`28f7ac359bb8ec752ad91dd94fcf6bede86b021d60859576253eca5a7cf63e86dd`).

Then we can run the command to isolate the key with the following command:
```
vega wallet key isolate --wallet="testnet-jeremy" --pubkey="f7ac359bb8ec752ad91dd94fcf6bede86b021d60859576253eca5a7cf63e86dd"
```

Which should give you a similar paylod to this:
```
✗ You are running an unreleased version of the Vega wallet. Use it at your own risk!

Enter passphrase:

✓ Key pair has been isolated in wallet testnet-jeremy.f7ac359b.isolated at: /Users/jeremy/Library/Application Support/vega/wallets/testnet-jeremy.f7ac359b.isolated
✓ Key isolation succeeded
```

Note:
> The new wallet will use the same passphrase that you used previously.

We can use the following commands to check that our new wallet have been created, and the type has changed, but both share the same ID:
```
vega wallet info --wallet="testnet-jeremy.f7ac359b.isolated"
✗ You are running an unreleased version of the Vega wallet. Use it at your own risk!

Enter passphrase:

Type:
HD wallet (isolated)
Version:
1
ID:
faa7088f3cbcba57aa78c6ec0635245a863a4ecf6faa04b9d19a1a4e867e56a2


vega wallet info --wallet="testnet-jeremy"
✗ You are running an unreleased version of the Vega wallet. Use it at your own risk!

Enter passphrase:

Type:
HD wallet
Version:
1
ID:
faa7088f3cbcba57aa78c6ec0635245a863a4ecf6faa04b9d19a1a4e867e56a2
```

Then we can import the wallet with the usual nodewallet command:
```
vega nodewallet import --force --chain=vega --wallet-path="/Users/jeremy/Library/Application Support/vega/wallets/testnet-jeremy.f7ac359b.isolated"
Enter node wallet passphrase:
Enter blockchain wallet passphrase:
import successful:
walletFilePath:
/Users/jeremy/Library/Application Support/vega/node/wallets/vega/vega.1634033275545523000
registryFilePath:
/Users/jeremy/Library/Application Support/vega/node/wallets.encrypted
```

Then we can also generate our validator payload to be used on the tendermint genesis file as usual:
```
vega genesis new validator --country="FR" --info-url="http://lol.com" --name="node-1"
Enter node wallet passphrase:
Info to add in genesis file under `validators` key
{
  "address": "F24729B009240597C435418F2177225CCDF8BB0B",
  "pub_key": {
    "type": "tendermint/PubKeyEd25519",
    "value": "ForcM0ZNQPDSyCP12hHjTF/XoKI5Pe2DTmxwLq7NOu8="
  },
  "power": "10",
  "name": ""
}
Info to add in genesis file under `app_state.validators` key
{
    "ForcM0ZNQPDSyCP12hHjTF/XoKI5Pe2DTmxwLq7NOu8=": {
      "id": "faa7088f3cbcba57aa78c6ec0635245a863a4ecf6faa04b9d19a1a4e867e56a2",
      "vega_pub_key": "f7ac359bb8ec752ad91dd94fcf6bede86b021d60859576253eca5a7cf63e86dd",
      "ethereum_address": "0x1Ebe188952aB6035ADaD21eA1C4F64Fd2EAC60E1",
      "tm_pub_key": "ForcM0ZNQPDSyCP12hHjTF/XoKI5Pe2DTmxwLq7NOu8=",
      "info_url": "http://lol.com",
      "country": "FR",
      "name": "node-1",
      "avatar_url": ""
    }
  }
```
