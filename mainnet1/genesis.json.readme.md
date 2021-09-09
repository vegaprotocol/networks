Comments on genesis.json:

Any entry specifying a "number of tokens" has to include the number plus all the decimals so to enter 1.0 write 1000000000000000000 for asset with 18 decimals.

"replay_attack_threshold" counts how many blocks are stored for replay protection; any transaction needs to contain a hash of one those blocks to be accepted. 

"market.auction.minimumDuration" needs to be revisited once we see block durations in the real world; the logic is that at least a bot should have time to notice market entered an auction and respond.

"market.liquidityProvision.shapes.maxSize" need to test how many LPs we can have with this many pegs without impacting block time. 

If we create "reward.staking.delegation.maxPayoutPerEpoch": "???", what value shall we set. Maybe 7000 Vega so 7000000000000000000000 . 

"validators.epoch.length" should be around 24h or we'll get strange reward behaviour and e.g. above "reward.staking.delegation.maxPayoutPerEpoch" amount assumes 24h.