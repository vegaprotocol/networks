# Vega Protocol: Networks

This repository contains the Genesis configuration files for public Vega networks. Below you will find instructions explaining how to create and operate a Vega network, as well as guidance on proposing changes to the Genesis configuration of existing networks.

*Please note that the configuration in this repository is not currently being used to support any functional networks. This is a new process that has been established to launch Vega networks with third-party validators, and will evolve over the next few weeks as the Restricted Mainnet is established.*

## Contents

* [The Vega Software](#the-vega-software)
* [Tendermint](#tendermint)
* [Environment Setup](#environment-setup)
* [Joining a Network](#joining-a-network)
* [Backups](#backups)
* [Running a Production Network](#running-a-production-network)
* [Data Node](#data-node)
* [Ethereum Event Forwarder](#ethereum-event-forwarder)
* [Monitoring](#monitoring)
* [Restore from Checkpoint](#restore-from-checkpoint)

## The Vega Software

First of all, in order to create a Vega network, you will need access to the latest Vega protocol binary. The code for the Vega software, which implements a decentralised protocol for trading derivatives, is currently managed via a private GitHub repository. We will soon start to publish releases to a public repository as compiled binaries, similar to how the Ren project manages new [Darknode releases](https://github.com/renproject/darknode-release). Eventually, the protocol software will be public and open source, but this only expected to happen after Mainnet has been established for some time.

*The guidance that follows is only useful if you already have a compiled Vega binary, which can currently only be obtained from the project team.*

## Tendermint

The Vega protocol software implements BFT consensus using vanilla [Tendermint](https://github.com/tendermint/tendermint) via ABCI integration. In order to ensure compatibility between Tendermint versions, and the Vega binary that you are using, the Vega binary ships with the correct Tendermint version compiled inside of it. You are free to use a separate Tendermint installation if you wish, but it is advisable to use the version that is made available to you by the Vega binary to ensure compatability across releases.

Tendermint is available using the command below:

```
root@ubuntu-s-4vcpu-8gb-amd-lon1-01:~# vega tm version
0.34.11
```

## Environment Setup

It is best to run your Vega node in a clean environment, where Tendermint has not been installed before. The following instructions assume this is the case; if it's not then you might not be able to rely on them.

### Initialize Vega

Firstly, we need to create a Vega home directory where the configuration for our node will be stored. You can do this using the command below. You will be asked to enter a passphrase, which is used to encrypt your Vega private keys.

```
root@ubuntu-s-4vcpu-8gb-amd-lon1-01:~# vega init
please enter nodewallet passphrase:
2021-08-20T12:06:16.214Z	INFO	vega/init.go:119	configuration generated successfully	{"path": "/etc/vega"}
```

You can check that this step was completed successfully by listing the contents of the Vega home directory.

```
root@ubuntu-s-4vcpu-8gb-amd-lon1-01:~# ll /etc/vega/
total 36
drwx------  7 root root 4096 Aug 20 12:06 ./
drwxr-xr-x 93 root root 4096 Aug 20 12:06 ../
-rw-r--r--  1 root root 8173 Aug 20 12:06 config.toml
drwx------  2 root root 4096 Aug 20 12:06 nodewallet/
```

### Generating Vega Keys

Next, we need to generate our Vega keypair. This Vega keypair is used to identify our node on the Vega blockchain. You will be asked to enter your passphrase again, and the mnemonic used to create your private keys will be displayed in the console. Make a note of this mnemonic, and store it securely offline.

```
root@ubuntu-s-4vcpu-8gb-amd-lon1-01:~# vega nodewallet generate --chain vega
please enter node wallet passphrase:
please enter blockchain wallet passphrase:
generation successful
additional data:
{
    "mnemonic": "outside hungry soccer rally more rough tuna lunch wagon hood click labor stem total soon junk siren employ forward spider model mad expand pizza"
}
```

### Generating Ethereum Keys

The Vega network implements a bridge to Ethereum, where collateral assets are held in a smart contract. The Ethereum bridge contract is controlled by the Vega validators via multi-signing. Therefore, every Vega node needs to also manage "hot" Ethereum keys. In this step we generate a new Ethereum key, which is used to sign transactions on the Ethereum chain.

```
root@ubuntu-s-4vcpu-8gb-amd-lon1-01:~# vega nodewallet generate --chain ethereum
please enter node wallet passphrase:
please enter blockchain wallet passphrase:
generation successful
```

The Ethereum wallet will be encrypted using the passphrase that you defined for your Vega `nodewallet`. The Ethereum key is available in encrypted format at the following location.

```
root@ubuntu-s-4vcpu-8gb-amd-lon1-01:~# ll /etc/vega/nodewallet/ethereum/
total 12
drwx------ 2 root root 4096 Aug 20 12:18 ./
drwx------ 4 root root 4096 Aug 20 12:13 ../
-rw------- 1 root root  491 Aug 20 12:18 UTC--2021-08-20T12-18-46.295673471Z--a0fd251fe9d66d1b37236a04e70427c3d388972c
```

### Initialize Tendermint

We need to initialize Tendermint on our node. The Tendermint home directly is initialized using the command below:

```
root@ubuntu-s-4vcpu-8gb-amd-lon1-01:~# vega tm init
I[2021-08-20|12:24:58.308] Generated private validator                  module=main keyFile=/root/.tendermint/config/priv_validator_key.json stateFile=/root/.tendermint/data/priv_validator_state.json
I[2021-08-20|12:24:58.309] Generated node key                           module=main path=/root/.tendermint/config/node_key.json
I[2021-08-20|12:24:58.309] Generated genesis file                       module=main path=/root/.tendermint/config/genesis.json
```

### Ethereum Configuration

The Vega network requires a synchronized Ethereum node to list to events on the ERC20 collateral bridge and staking smart contract. You can configure the URL for your Ethereum node inside `/etc/vega/config.toml` by editing the section below:

```
[NodeWallet]
  Level = "Info"
  [NodeWallet.ETH]
    Level = "Info"
    Address = "https://ropsten.infura.io/v3/YOUR-API-KEY"
```

## Joining a Network

In order to join a network the public keys of your validator need to be included in a Genesis file. The Gensis files for public Veg networks are maintained in this repository. You will be required to generate the appropraite configuration for your validator, and submit a pull request on this repository for the Gensis file of the network you wish to join.

### Genesis Config for Validator

Generate the Genesis config for your validator with the command below. You will need to enter your passphrase again.

```
root@ubuntu-s-4vcpu-8gb-amd-lon1-01:~# vega genesis new validator --country UK --info-url "https://vega.xyz"
please enter node wallet passphrase:
Info to add in genesis file under `validators` key
{
  "address": "7ADAD3BE389A4730E10D99A20C6C95D038C91FE3",
  "pub_key": {
    "type": "tendermint/PubKeyEd25519",
    "value": "tEyd54Ob9hCw3g5/Gm/lejBxzdDdJroekEsEFsse5ic="
  },
  "power": "10",
  "name": ""
}
Info to add in genesis file under `app_state.validators` key
{
  "tEyd54Ob9hCw3g5/Gm/lejBxzdDdJroekEsEFsse5ic=": {
    "vega_pub_key": "b4ec8bbe9ba417680bd17f5a02eae46cf0f60b44dc6eb637f951803a298ac2cc",
    "ethereum_address": "0xa0fD251fe9d66D1b37236a04E70427c3D388972C",
    "info_url": "https://vega.xyz",
    "country": "UK"
  }
}
```

The output above describes where to add this config in the Genesis file. Navigate to the appropriate network in this repository, add your configuration details, and submit a pull request.

### Running your Node

Once you have added your validator config to the Genesis file, you need to execute two commands to start your node. When you start Tendermint, it will download the Genesis file from this repository and use it to initialize the network. The command below will start Tendermint on your server. Notice that you need to pass the `--network` flag to Tendermint. This network flag must match the directory from this repository, which matches the network you wish to join.

```
root@ubuntu-s-4vcpu-8gb-amd-lon1-01:~# vega tm node --network testnet1
I[2021-08-20|13:39:24.861] Starting multiAppConn service                module=proxy impl=multiAppConn
```

Once you have started Tendermint you can proceed with starting your Vega node (do this in a separate terminal window).

```
root@ubuntu-s-4vcpu-8gb-amd-lon1-01:~# vega node
please enter node wallet passphrase:
2021-08-20T13:44:56.178Z	INFO	cfgwatcher	config/watcher.go:74	config watcher started successfully	{"config": "/etc/vega/config.toml"}
2021-08-20T13:44:56.178Z	INFO	node/node_pre.go:97	Starting Vega	{"config-path": "/etc/vega", "version": "", "version-hash": ""}
2021-08-20T13:44:56.178Z	DEBUG	node/node_pre.go:110	Set ulimits	{"nofile": 8192}
2021-08-20T13:44:56.221Z	INFO	node/node_pre.go:125	node setted up with badger store support
```

If everything is working correctly you will be able to switch to the Tendermint tab and see that it is producing blocks.

## Backups

You might like to backup the following directories in case anything goes wrong:

* `~/.tendermint` - the Tendermint home directory containing the Vega blockchain
* `/etc/vega` - the Vega home directory containing your encrypted wallets (both Vega and Ethereum keys)

## Data Node

The Data Node exposes APIs that make it easier to interact with the Vega network.The APIs made available by the Data Node application are REST, gRPC and GraphQL. The following instructions explain how to run a Data Node alongside your validator.

Firstly, you need to initialize your environment with the command below:

```
root@ubuntu-s-4vcpu-8gb-amd-lon1-01:~# data-node init
2021-09-09T15:23:14.057Z	INFO	data-node/init.go:90	configuration generated successfully	{"path": "/etc/vega_data_node"}
```

Next, edit the `/etc/vega/config.toml` file and set `Enabled=true` under the `Broker` configuration section:

```
[Broker]
  Level = "Info"
  [Broker.Socket]
    DialTimeout = "2m0s"
    DialRetryInterval = "5s"
    SocketQueueTimeout = "3s"
    EventChannelBufferSize = 10000000
    SocketChannelBufferSize = 1000000
    MaxSendTimeouts = 10
    IP = "0.0.0.0"
    Port = 3005
    Enabled = true
    Transport = "tcp"
```

Now you can run the data node binary alongside Tendermint and Vega with the following command:

```
root@ubuntu-s-4vcpu-8gb-amd-lon1-01:~# data-node node
2021-09-09T15:27:25.986Z	INFO	cfgwatcher	config/watcher.go:74	config watcher started successfully{"config": "/etc/vega_data_node/config.toml"}
2021-09-09T15:27:25.986Z	INFO	node/node_pre.go:68	Starting Vega	{"config-path": "/etc/vega_data_node", "version": "", "version-hash": ""}
```

If everything is working correctly you will be able to access gRPC on port 3007, GraphQL on 3008 and REST on port 3009.

Detailed API docs are available [here](https://docs.fairground.vega.xyz/).

## Ethereum Event Forwarder

The Vega blockchain implements a bridge to Ethereum, where collateral assets are stored in a smart contract. In order to keep the Vega network in sync with events on Ethereum it is necessary to run the `ethereum-event-forwarder` application alongside your validator. The Event Queue is a relatively simple Node.js application, and it is available at the following public repository:

- [vegaprotocol/ethereum-event-forwarder](https://github.com/vegaprotocol/ethereum-event-forwarder)

In order to avoid spam on the validator node, we implemented an allow-listing mecanism. You will need to create a Vega wallet for the `ethereum-event-forwarder`, using the following steps:

Create a wallet using the following command:

```
vega wallet init # optional if you already done that previously
vega wallet key generate --name="ethereum-event-queue-testnet"
```

This command will dump information to the console, be sure to save the mnemonic, also copy the public key and use it in the following section of the Vega config (config.toml) in the Vega root directory:

```
[EvtForward]
  Level = "Info"
  RetryRate = "10s"
  BlockchainQueueAllowlist = ["ADD_THE_WALLET_PUBKEY_HERE"]
```

Then we need to save the private key as well to be used by the `ethereum-event-forwarder` see the repository README (secret.key). By running the following command you should be able to see the private key of the wallet you just created:

```
vega wallet key list --name="ethereum-event-queue-testnet"
```

Lastly, the `config.toml` to be used with the `ethereum-event-forwarder` is availble in this repository at the [following location](https://github.com/vegaprotocol/networks/blob/master/testnet1/ethereum-event-forwarder-config.toml). This config is for `testnet1`, you should use the config file for the network that you are trying to join by navigating to the relevant directory in this repository.

## Monitoring

The guidance below should be helpful for monitoring a network to ensure the node are online and functioning as expected.

* [Zabbix](https://www.zabbix.com) is useful for monitoring CPU usage, average load, system memory, swap usage, available disk space, disk I/O and network I/O.
* Zabbix per-app monitoring is also useful for Tendermint, Vega and Data Node usage stats
* http://localhost:3003/statistics exposes consensus and app specific data from each node; e.g. transactions per block, blocks per second, trades per block, up-time
* Tendermint and consensus monitoring is available via [RPC over HTTP](https://docs.tendermint.com/master/rpc) using port 26657

## Restore from Checkpoint

The Vega blockchain periodically stores checkpoints of important state parameters, such as balances and unrealised profit and loss. This allows the chain to be restarted from a previously valid state in the event of a critical issue being discovered, or in the event of consensus failure. 

The checkpoint files are written to `/etc/vega/checkpoints` and each checkpoint is identified by a hash, which is present in the name of the checkpoint file. The checkpoint file name adheres to the following pattern: `<date>-<block>-<checkpoint-hash>.cp`.

In order to start a network using a checkpoint file the Genesis file needs to be populated with a valid checkpoint hash:

```
{
   "checkpoint": {
       "load_hash": ""
   }
}
```

A new chain can now be started (with block height of zero) using the previous state. Once the chain is up and running one of the validators should restore the checkpoint file using the following command:

```
vega restore -f=<checkpoint-file>.cp
```

The block height will start to incremement before the restore transaction has been executed, but the Vega application will simply ignore all transactions that get broadcast until the checkpoint has been restored.
