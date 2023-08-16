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
* [Monitoring](#monitoring)
* [Restore from Checkpoint](#restore-from-checkpoint)
* [Restore from Snapshot](#restore-from-snapshot)
* [Tendermint Configuration](#tendermint-configuration)

## The Vega Software

In order to create a Vega network, you will need access to the [latest](https://github.com/vegaprotocol/vega/releases/latest) Vega protocol binary.

## Tendermint

The Vega protocol software implements BFT consensus using vanilla [CometBFT (fork of Tendermint Core)](https://github.com/cometbft/cometbft) via ABCI integration. In order to ensure compatibility between CometBFT versions, and the Vega binary that you are using, the Vega binary ships with the correct CometBFT version compiled inside of it. You are free to use a separate CometBFT installation if you wish, but it is advisable to use the version that is made available to you by the Vega binary to ensure compatability across releases.

Tendermint is available using the command below:

```
root@ubuntu-s-4vcpu-8gb-amd-lon1-01:~# vega tm version
0.34.27
```

## Environment Setup

It is best to run your Vega node in a clean environment, where CometBFT has not been installed before. The following instructions assume this is the case; if it's not then you might not be able to rely on them.

### Vega Home Path

The Vega home directory varies depending on OS. In these instructions it is assumed to be `/etc/vega`. You can set your own home directory when initialising your environment by executing `vega init --home /my/home/dir`.

The following command may also be helpful: `vega paths list`

More information is available [here](https://github.com/vegaprotocol/vega-snapshots#files-location).

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

Next, we need to generate our Vega keypair, we recommend you generate your keypairs following the [isolated vega wallet guide](https://github.com/vegaprotocol/networks/blob/master/isolated-vega-wallets.md)

Once your vega wallet have been generated, you will need to import them in your nodewallet. First we need to locate the wallet, this can be done using the following command:
```
root@ubuntu-s-4vcpu-8gb-amd-lon1-01:~# vega paths list | grep -w "WalletsDataHome"
  WalletsDataHome			/etc/vega/data/wallets
```

> note: this path may differ depending of your operating system.

Now we can import the wallet previously created:
```
vega nodewallet import --force --chain=vega --wallet-path="/etc/vega/data/wallets/testwallet.29973a5c.isolated"
Enter node wallet passphrase:
Enter blockchain wallet passphrase:
import successful
```

### Generating Ethereum Keys

The Vega network implements a [bridge to Ethereum](./conracts.md), where collateral assets are held in a smart contract. The Ethereum bridge contract is controlled by the Vega validators via multi-signing. Therefore, every Vega node needs to also manage "hot" Ethereum keys. In this step we generate a new Ethereum key, which is used to sign transactions on the Ethereum chain.

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

### Initialize CometBFT

We need to initialize CometBFT on our node. The Tendermint home directly is initialized using the command below:

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

## Monitoring

The guidance below should help monitor a single node as well as a network.

* general - you can use any tool to monitor CPU, load, memory, swap, disk usage, disk I/O, networking I/O etc.
* validator node or core node
  * Prometheus - in `[Metrics]` section of core's `config.toml` you can configure and enable metrics for Prometheus,
    * important: please don't expose this endpoint to the Internet on production. Instead, use a local scraper like grafana-agent,
  * Statistics - `/statistics` of `[API.REST]` exposes core data about the node, e.g. transactions per block, blocks per second, trades etc.
    * you can use `vegaTime` (time of the latest block processed by the node's core) and `currentTime` (clock time) to quickly tell if the node is healthy and up to date,
  * CometBFT - available via [RPC over HTTP](https://docs.cometbft.com/v0.34/rpc/) using port 26657,
* data-node
  * every data-node needs a running core service, so please configure `core node` monitoring from the previous point,
  * Prometheus - in `[Metrics]` section of data-node's `config.toml` you can configure and enable metrics for Prometheus,
    * important: please don't expose this endpoint to the Internet on production. Instead, use a local scraper like grafana-agent,
    * note: this is a different endpoint than core
  * Statistics - `/statistics` of `[Gateway]` exposes core data about the node, e.g. transactions per block, blocks per second, trades etc.
    * important: this is information from the core process, not data-node,
    * response contains `x-block-*` headers.
  * `x-block-*` response headers - every response contains `x-block-height` and `x-block-timestamp` headers that can be used for monitoring,
    * you can compare `x-block-timestamp` with the wall clock to quickly tell if the node is healthy and up to date,
  * PostgreSQL - use any tool to monitor the PostgreSQL db, e.g. [postgres_exporter](https://github.com/prometheus-community/postgres_exporter),
    * TimescaleDB - you want to also monitor metrics of TimescaleDB extension,
* network
  * technical - blocks, validators, event stream, etc.
    * core's Prometheus - it contains CometBFT metrics,
    * CometBFT - scrape data from CometBFT [RPC over HTTP](https://docs.cometbft.com/v0.34/rpc/)
    * data-node's Prometheus - general stats about events streamed from the core,
  * financial - markets, trades, deposits, etc.
    * core's Prometheus metrics - general stats,
    * data-nodes's Prometheus metrics - general stats,
    * data-nodes PostgreSQL - for precise data, the best option is to connect your monitoring tool directly to the database,
      * TimescaleDB - data-node uses [TimescaleDB](https://www.timescale.com/) extension to PostgreSQL, which makes it a time-series database, which is perfect for monitoring and analytics tools like Grafana,
      * please don't scrape data-node data and push it to Prometheus or a similar tool, because you will lose precision
    * vega-monitoring - not-stable! early developer phase, a tool that adds more data into the data-node's database, more details [here](https://github.com/vegaprotocol/vega-monitoring)

Example setup:
* Grafana server to visualise,
* Prometheus to store metrics,
* Data-node's TimescaleDB for precise financial metrics,
* Grafana-agent to scrape Prometheus endpoints from localhost, and cpu/disk/etc, and postgres_exporter, and send evrything to the Prometheus server.

## Restore from Checkpoint

The Vega blockchain periodically stores checkpoints of important state parameters, such as balances. This allows the chain to be restarted from a previously valid state in the event of a critical issue being discovered, or in the event of consensus failure.

The checkpoint files are written to `/etc/vega/checkpoints` and each checkpoint is identified by a hash, which is present in the name of the checkpoint file. The checkpoint file name adheres to the following pattern: `<date>-<block>-<checkpoint-hash>.cp`.

In order to start a network using a checkpoint file the Genesis file needs to be populated with a valid checkpoint hash:

```
{
   "checkpoint": {
       "load_hash": ""
   }
}
```

Prior to starting a chain from a checkpoint you will want to make sure you execute `vega tm unsafe_reset_all` to nuke the previous chain.

A new chain can now be started (with block height of zero) using some of the previous state. Once the chain is up and running one of the validators should restore the checkpoint file using the following command:

```
vega checkpoint restore -f=<checkpoint-file>.cp
```

The block height will start to incremement before the restore transaction has been executed, but the Vega application will ignore all transactions until the checkpoint has been restored.

### Checkpoint Data

Checkpoints contain the following data:

* Assets (pending and active)
* Collateral (total balance per party/asset)
* Network parameters (all of them, key-value)
* Governance (enacted proposals only, on restore, these proposals will get enacted unless between the checkpoint being created and restored, some proposals have expired)
* Epoch: The current epoch
* Delegation (active and pending delegation actions)

## Restore from Snapshot

Snapshots allow a node to go "offline" and rejoin the network later without needing to replay the entire chain. Instructions for rejoining an existing network using a snapshot file are coming soon.

## Tendermint Configuration

The following Tendermint configuration (`/root/.tendermint/config/config.toml`) is recommended:

```
[consensus]

# Make progress as soon as we have all the precommits (as if TimeoutCommit = 0)
skip_timeout_commit = true

# EmptyBlocks mode and possible interval between empty blocks
create_empty_blocks = true
create_empty_blocks_interval = "0s"
# How long we wait for a proposal block before prevoting nil
timeout_propose = "3s"
# How much timeout_propose increases with each round
timeout_propose_delta = "500ms"
# How long we wait after receiving +2/3 prevotes for "anything" (ie. not a single block or nil)
timeout_prevote = "1s"
# How much the timeout_prevote increases with each round
timeout_prevote_delta = "500ms"
# How long we wait after receiving +2/3 precommits for "anything" (ie. not a single block or nil)
timeout_precommit = "1s"
# How much the timeout_precommit increases with each round
timeout_precommit_delta = "500ms"
# How long we wait after committing a block, before starting on the new
# height (this gives us a chance to receive some more precommits, even
# though we already have +2/3).
timeout_commit = "1s"

[mempool]

recheck = true
```
