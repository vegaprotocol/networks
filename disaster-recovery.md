# Disaster Recovery

This documentation describes how to recover from critical network failure scenarios.

## Scenario 1: Dealing with compromised keys, or loss of network control

The following section deals with the situation where different keys become compromised, or where the validators collectively lose control of the network, or critical components comprising the application stack.

### Scenario 1.1: Ethereum key compromised

1. Notify the validators that control the `MultisigControl` contract that your Ethereum key has been compromised and needs to be updated.
2. The `remove_signer` function must be executed on the `MultisigControl` contract to remove the compromised key. Each signatory on the `MultisigControl` contract needs to generate their own signature, and a single signature bundle will be submitted to the contract when calling `remove_signer`.
3. After removing the compromised key, the new key for the validator must be added to the `MultisigControl` contract by calling the `add_signer` function. The signature bundle is generated in the same way as for (2).
4. The Vega CLI can be used to generate signatures, please execute `vega bridge erc20 -h` for further instructions.

### Scenario 1.2: Vega hot key compromised

TBC

### Scenario 1.3: Vega master key compromised

TBC

### Scenario 1.4: Tendermint key compromised

TBC

### Scenario 1.5: Several keys compromised in a short period of time

TBC

### Scenario 1.6: Validator (and their keys) permanently gone, i.e. bankrupt

TBC

### Scenario 1.7: Loss of control of MultiSig contract on Ethereum

TBC

## Scenario 2: Incorrect Genesis file configuration

TBC

## Scenario 3: Less than 2/3+1 of the validators are active

TBC

## Scenario 4: Critical bugs

The following section describes how to resolve critical bugs that manifest in various components within the Vega application stack.

### Scenario 4.1: Critical bug in Vega core ABCI application

TBC

### Scenario 4.2: Critical big in a smart contract used by the network

TBC
