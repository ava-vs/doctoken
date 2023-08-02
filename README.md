# ICRC7

## Abstract

This is an ICRC-7 standard implementation in Motoko. Although the ICRC-7 standard is currently in its draft phase, this implementation strives to provide developers with a practical, readily deployable solution for introducing Non-Fungible Tokens (NFTs) on the Internet Computer Protocol (ICP) within real-world applications. Our focus is on enabling seamless integration and efficient canister management to facilitate the smooth adoption of NFTs in the ICP ecosystem. We understand the importance of accessible solutions during this transformative phase, and we aim to provide a reliable starting point for those eager to explore the NFT space on ICP.

### Non-Standard Methods

To support the implementation's readiness, we've introduced some non-standard methods that enhance canister management and streamline the integration process. The "mint" method is one such addition, facilitating the creation of new NFTs with metadata, attributes, and ownership credentials. This allows for greater customization while adhering to the core principles of the ICRC-7 standard. Another non-standard method we've included is "get_transactions", which empowers developers to efficiently retrieve transaction data for NFTs. This functionality promotes seamless integration with existing applications and paves the way for building innovative NFT marketplaces, provenance trackers, and other services that rely on transaction history.

### Contributions

To support the implementation's readiness, we've introduced some non-standard methods that enhance canister management and streamline the integration process. The "mint" method is one such addition, facilitating the creation of new NFTs with metadata, attributes, and ownership credentials. This allows for greater customization while adhering to the core principles of the ICRC-7 standard. Another non-standard method we've included is "get_transactions," which empowers developers to efficiently retrieve transaction data for NFTs. This functionality promotes seamless integration with existing applications and paves the way for building innovative NFT marketplaces, provenance trackers, and other services that rely on transaction history.

## Specification

For standard methods and structures documentation, read the [specifications](https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-7/ICRC-7.md).

### mint

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

### get_transactions

Returns the transaction history of the ledger or  the account given as an argument. This query is paginated, the results are provided in chronological order, from the most recent to the oldest.

```candid "Methods" +=
get_transactions : (GeTransactionsArgs) -> (GetTransactionsResult) query;
```

```candid "Type definitions" +=
type GeTransactionsArgs = record {
    limit: nat;
    offset: nat;
    account: opt Account;
};

type GetTransactionsResult = record {
    total: nat;
    transactions: vec Transaction;
};

type Transaction = record {
    kind: Text;// "icrc7_transfer" | "mint" | "icrc7_approve" ...
    timestamp: nat64;
    mint: opt record {
      to: Account;
      token_ids: vec nat;
    };
    icrc7_transfer: opt record{
      from: Account;
      to: Account;
      spender: opt Account;
      token_ids: vec nat;
      memo: opt blob;
      created_at_time: opt nat64;
    };
    icrc7_approve: opt record {
      from: Account;
      spender: Account;
      token_ids: opt vec nat;
      expires_at: opt nat64;
      memo: opt blob;
      created_at_time: opt nat64;
    };
  };
```
