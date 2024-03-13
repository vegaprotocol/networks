# Vega Protocol: Networks

This repository contains the Genesis and the Vegawallet configuration files for public Vega networks: the Alpha Mainnet and the Testnet.
Below you will find instructions explaining how to create and operate a Vega network.

## Contents

* [The Vega Software](#the-vega-software)
* [Public Vega Networks](#public-vega-networks)
* [Other Vega Networks](#other-vega-networks)
* [Monitoring](#monitoring)

## The Vega Software

To create, run and fully use a Vega Network you will need:
* Vega binary ([latest](https://github.com/vegaprotocol/vega/releases/latest)) which contains:
  - Core - starts a validator or non-validator node, responsible for consensus. It contains CometBFT,
  - Data Node - starts a node that is not a validator, but aggregates all information about the network state and history and exposes it through API,
    - note: to run a data-node you need to also start a non-validator core,
  - Vegawallet CLI - to interact with a network,
  - Block Explorer - a service that exposes detailed information about blocks,
* Vegavisor binary ([latest](https://github.com/vegaprotocol/vega/releases/latest)) - the recommended way of running a vega node
* Vegawallet browser extension for Firefox and Chrome ([information and installation information](https://github.com/vegaprotocol/vegawallet-browser))
* Ethereum Smart Contracts ([more](https://github.com/vegaprotocol/Multisig_Control_V2))
* To setup a [validator node or a data-node from scratch](https://docs.vega.xyz/testnet/node-operators)

More information can be found at [https://docs.vega.xyz](https://docs.vega.xyz):
* [Advanced operations](https://docs.vega.xyz/testnet/node-operators/how-to)
* [Visor overview](https://docs.vega.xyz/testnet/node-operators/visor)

Other Information:

* See the list oif the [list of smart contracts](contracts.md)
* View the [Disaster Recovery](disaster-recovery.md) process
* [Isolated vega wallets](isolated-vega-wallets.md)

## Public Vega Networks

### The Alpha Mainnet

- Genesis: [mainnet1/genesis.json](mainnet1/genesis.json)
- Vegawallet config: [mainnet1/mainnet1.toml](mainnet1/mainnet1.toml)
- Trading Console: https://console.vega.xyz (you will be redirected to the IPFS site)
- Block Explorer: https://explorer.vega.xyz/
- Governance Site: https://governance.vega.xyz/

### The Testnet
- Genesis: [testnet2 genesis.json](https://github.com/vegaprotocol/networks/blob/master/testnet2/genesis.json)
- Vegawallet config: [testnet2.toml](https://github.com/vegaprotocol/networks/blob/master/testnet2/testnet2.toml)

## Other Vega Networks

### The Mainnet Mirror
- Genesis: [mainnet mirror genesis.json](https://github.com/vegaprotocol/networks-internal/blob/main/mainnet-mirror/genesis.json)
- Vegawallet config: [vegawallet-fairground.toml](https://github.com/vegaprotocol/networks-internal/blob/main/mainnet-mirror/vegawallet-mainnet-mirror.toml)
- Trading Console: https://console.mainnet-mirror.vega.rocks/ (you will be redirected to the IPFS site)
- Block Explorer: https://explorer.mainnet-mirror.vega.rocks/
- Governance Site: https://governance.mainnet-mirror.vega.rocks/

### Fairground
- Genesis: [fairground genesis.json](https://github.com/vegaprotocol/networks-internal/blob/main/fairground/genesis.json)
- Vegawallet config: [vegawallet-fairground.toml](https://github.com/vegaprotocol/networks-internal/blob/main/fairground/vegawallet-fairground.toml)
- Trading Console: https://console.fairground.wtf/ (you will be redirected to the IPFS site)
- Block Explorer: https://explorer.fairground.wtf/
- Governance Site: https://governance.fairground.wtf/

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
