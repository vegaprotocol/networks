# Start your own data-node

Follow below steps to start your data-node

### 1. Install all required tools

- wget
- unzip
- jq

```shell
sudo apt-get install -y wget unzip jq
```

### 2. Clone the vegaprotocol/networks repository

```shell
git clone https://github.com/vegaprotocol/networks.git ~/networks

# pull the latest version of that repo
git pull
```

### 3. Download vegavisor binary

Download it from the [v0.71.4 release](https://github.com/vegaprotocol/vega/releases/tag/v0.71.4) and put it in `<vegavisor_home>`

```shell
cd ~/networks/mainnet1/data-node-run/vegavisor_home

wget https://github.com/vegaprotocol/vega/releases/download/v0.71.4/visor-linux-amd64.zip
unzip visor-linux-amd64

# check vegavisor version
./visor version
# Vega Visor CLI v0.71.4 (...)
```

### 4. Prepare your visor config

You have to decide here how you want to start your data node. You have two options:

- Start from block `0` -  You must start from the binary `v0.71.4` and let vegavisor upgrade your network to the current version. Depending on the network age, it will take several hours up to several days.
- Start from the network history - You start the network from the latest version and let your node sync with the rest of the network thru the internet. It is the recommended way to start the data node. It takes up to a few minutes to start and catch your node up with the network.


#### a. Start from block 0

If you plan to start from the network history, skip this section and go directly to the [b. Start from the network-history](#b.-start-from-the-network-history) section

Download the [vega v0.71.4](https://github.com/vegaprotocol/vega/releases/tag/v0.71.4).

```shell
# go to <vegavisor_home>/genesis
cd ~/networks/mainnet1/data-node-run/vegavisor_home/genesis

wget https://github.com/vegaprotocol/vega/releases/download/v0.71.4/vega-linux-amd64.zip --output-document vega-linux-amd64.zip
unzip vega-linux-amd64.zip
```

Check the `vega version`

```shell
./vega version

# Vega CLI v0.71.4 (...)
```

Tell visor to run the v0.71.4(aka genesis); You have to link `<vegavisor_home>/genesis` folder to `<vegavisor_home>/current` path.

```shell
# link genesis to current
ln -s $HOME/networks/mainnet1/data-node-run/vegavisor_home/genesis $HOME/networks/mainnet1/data-node-run/vegavisor_home/current

# check if linked correctly
ls -als | grep current
# 1 lrwxrwxrwx 1 daniel daniel  67 Jun 12 09:59 current -> /home/daniel/networks/mainnet1/data-node-run/vegavisor_home/genesis
~/networks/mainnet1/data-node-run/vegavisor_home/current/vega version
# Vega CLI v0.71.4 (...)
```

#### b. Start from the network-history

Check the current vega version. To get the vega version visit the [https://api.vega.community/statistics](https://api.vega.community/statistics), and check the `appVersion` parameter. We use v0.71.5 as current version

```shell
wget https://api.vega.community/statistics -qO- | jq -r '.statisticsappVersion'
# v0.71.5
```

Activate `v0.71.5` version in the vegavisor. We provide default config for that version.

```shell
cd ~/networks/mainnet1/data-node-run/vegavisor_home
cp -r example_v0.71.5 v0.71.5
```

Download the above vega version from the [vegaprotocol/vega releases page](https://github.com/vegaprotocol/vega/releases)

```shell
cd ~/networks/mainnet1/data-node-run/vegavisor_home/v0.71.5

wget https://github.com/vegaprotocol/vega/releases/download/v0.71.5/vega-linux-amd64.zip --output-document vega-linux-amd64.zip
unzip vega-linux-amd64.zip
```


Check the `vega version`

```shell
./vega version

# Vega CLI v0.71.5 (...)
```

Tell visor to run the v0.71.5; You have to link `<vegavisor_home>/v0.71.5` folder to `<vegavisor_home>/current` path.

```shell
ln -s $HOME/networks/mainnet1/data-node-run/vegavisor_home/v0.71.5 $HOME/networks/mainnet1/data-node-run/vegavisor_home/current
```


### 5. Init chain.

```shell
# init vega
~/networks/mainnet1/data-node-run/vegavisor_home/current/vega init --home ~/networks/mainnet1/data-node-run/vega_home/ full

# init data-node
~/networks/mainnet1/data-node-run/vegavisor_home/current/vega datanode init --home ~/networks/mainnet1/data-node-run/vega_home vega-mainnet-0011

# init tendermint
~/networks/mainnet1/data-node-run/vegavisor_home/current/vega tm init --home ~/networks/mainnet1/data-node-run/tendermint_home

# replace genesis
mv /home/daniel/networks/mainnet1/data-node-run/tendermint_home/config/genesis.json /home/daniel/networks/mainnet1/data-node-run/tendermint_home/config/genesis.json.bk
cp /home/daniel/networks/mainnet1/genesis.json /home/daniel/networks/mainnet1/data-node-run/tendermint_home/config/genesis.json
```

### 6. Update network configs

Update vega config. The fields you have to update are in the `vega_config_overrides.toml`


Update tendermint config:

- The fields for starting from block 0 are in the `tendermint_config_overrides_block_0.toml`
- The fields for starting from network-history 0 are in the `tendermint_config_overrides_network_history.toml`


Update data-node config. The fields you have to update are in the `datanode_config_overrides.toml`


### 7. Start the postgresql

You have to run `postgresql` with `timescaledb` extension.

We support only the following versions:

- Postgresql: `pg14`
- TimescaleDB: `v2.8.0`

You can use the following docker command:

```shell
docker volume create vega_pgdata

docker run -d \
    --rm \
    --name vega_postgresql \
    -e POSTGRES_USER=vega \
    -e POSTGRES_PASSWORD=vega \
    -e POSTGRES_DB=vega \
    -p 5432:5432 \
    -v vega_pgdata:/var/lib/postgresql/data \
    timescale/timescaledb:2.8.0-pg14 \
        -c "max_connections=50" \
        -c "log_destination=stderr" \
        -c "work_mem=5MB" \
        -c "huge_pages=off" \
        -c "shared_memory_type=sysv" \
        -c "dynamic_shared_memory_type=sysv" \
        -c "shared_buffers=2GB" \
        -c "temp_buffers=5MB"
```

If you have postgresql running and you are using different credentials, please update them in `~/networks/mainnet1/vega_home/config/data-node/config.toml`

The section, you have to update:

```toml
[SQLStore.ConnectionConfig]
    Host = "192.168.1.75"
    Port = 5432
    Username = "vega"
    Password = "vega"
    Database = "vega"
```


### 8. Start visor

```
cd ~/networks/mainnet1/data-node-run;

./vegavisor_home/visor run --home ./vegavisor_home
```

However We recommend to setup systemctl config

Create file: `/lib/systemd/system/vegavisor.service`

```conf
[Unit]
Description=vegavisor
Documentation=https://github.com/vegaprotocol/vega
After=network.target network-online.target
Requires=network-online.target

[Service]
User=<USER>
Group=<GROUP>
WorkingDirectory=/home/<USER>/networks/mainnet1/data-node-run
ExecStart="/home/<USER>/networks/mainnet1/data-node-run/vegavisor_home/visor" run --home ".//vegavisor_home"
TimeoutStopSec=10s
LimitNOFILE=1048576
LimitNPROC=512
PrivateTmp=true
ProtectSystem=full
AmbientCapabilities=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
```

Example for user `daniel` is:

```conf
[Unit]
Description=vegavisor
Documentation=https://github.com/vegaprotocol/vega
After=network.target network-online.target
Requires=network-online.target

[Service]
User=daniel
Group=daniel
WorkingDirectory=/home/daniel/networks/mainnet1/data-node-run
ExecStart="/home/daniel/networks/mainnet1/data-node-run/vegavisor_home/visor" run --home ".//vegavisor_home"
TimeoutStopSec=10s
LimitNOFILE=1048576
LimitNPROC=512
PrivateTmp=true
ProtectSystem=full
AmbientCapabilities=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
```

Reload service and start it


```shell
sudo systemctl daemon-reload
sudo systemctl start vegavisor
```


To check logs you can run the following commands:

```shell
journalctl -u vegavisor -n 1000 -f
```

### 9. Disable state sync when starting from network-history !!! IMPORTANT

When you start from the network history update `~/networks/mainnet1/data-node-run/tendermint_home/config/config.toml`

```toml
[statesync]
enable = false
```