# aVa Doctoken (ICRC-7 version)

## Overview

Cooming soon...

## ICRC-7 Specification

For standard methods and structures documentation, read the [specifications](https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-7/ICRC-7.md).

### Deployment

### Available methods

#### mint

Mint one token to the `to` account. Only the canister owner Account can mint a new token.
If the caller is not the owner, the ledger returns `variant { Unauthorized }` error.
The ledger can implement a supply cap. If the supply cap is set and the number of minted tokens has reach the supply cap, the ledger returns `variant { SupplyCapOverflow }`.
If the `to` account is equal to the `NULL_ACCOUNT`, the ledger returns `variant { InvalidRecipient }`.
If the caller is trying to mint an existing token id, the ledger returns `variant { AlreadyExistTokenId }`.

```candid "Methods" +=
mint : (MintArgs) -> (variant { Ok: nat; Err: MintError; });
```

```candid "Type definitions" +=
type MintArgs = record {
    to: Account;
    token_id: nat;
    metadata: vec record { text; Metadata };
};

type MintError = variant {
    Unauthorized;
    SupplyCapOverflow;
    InvalidRecipient;
    AlreadyExistTokenId;
    GenericError: record { error_code : nat; message : text };
};
```



