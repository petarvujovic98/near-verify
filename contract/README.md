# NEAR Verify Smart Contract

This smart contract acts as the registry for source verification - i.e. if a source is a trusted NEAR source.

## Methods

The contract must be initialized with a list of authorities who can pin verification statuses for sources and
add additional authorities to the authority set.

### submit_verification

This method accepts a verification entry ID - `entry_id` - (a string that represents a source to be verified
or marked as false) and a trust value - `trusted` - that signifies if a source is trusted or not.

You can call it using near CLI in the following way:

```bash
near call <contract_id> submit_verification '{"entry_id":"test","trusted":true}' --accountId <account_id>
```

### get_verification

This method accepts a verification entry ID - `entry_id` - and returns the trust score of this source.

You can call it using near CLI in the following way:

```bash
near view <contract_id> get_verification '{"entry_id":"test"}'
```

### pin_verification

This method accepts a verification entry ID - `entry_id` - and a trust value - `trusted` and pins a trust
score of this source to the provided trust value.

You can call it using near CLI in the following way:

```bash
near call <contract_id> pin_verification '{"entry_id":"test","trusted":true}' --accountId <account_id>
```

**Note:** This method can only be called by authorities.

### add_authority

This method accepts a list of authority account IDs - `authorities` - and adds them to the authorities
set.

You can call it using near CLI in the following way:

```bash
near call <contract_id> add_authorities '{"authorities":["test.near","test1.near"]}' --accountId <account_id>
```

**Note:** This method can only be called by authorities.

