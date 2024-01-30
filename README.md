# aVa Doctoken (draft ICRC-7 version)

## Overview

aVa Doctoken allows user to create an NFT document and issue [reputation](https://github.com/ava-vs/reputation/wiki) based on it. Default cost of NFT with reputation set to 750B (~$1) cycles.

### Preliminary Steps (you need [dfx](https://internetcomputer.org/docs/current/developer-docs/setup/install/) installed)
1. **Clone the repository**: Go to [https://github.com/ava-vs/doctoken/tree/release-03-22012024](https://github.com/ava-vs/doctoken/tree/release-03-22012024), fork and clone the repository.

2. **Adjust the parameters: Edit the `/commands/deploy-ic.sh` file in your fork and adjust the Name, Symbol and Description fields to suit your needs.

3. **Launch the Doctoken canister**: (Note: You must install [dfx](https://internetcomputer.org/docs/current/developer-docs/setup/install/) and fund your wallet for at least 3.6T cycles to create a canister).  Run the
 ```
cd commands
sh ./deploy-ic.sh
```
 to launch the doctoken canister.

### Issuing Certificates
1. **Get Internet Identity**: Make sure the user you want to issue a certificate to has an Internet Identity identifier. This will be used as the `user_principal'.

2. **Call the CreateCertificate method: To create a certificate, call the `createCertificate` method of the doctoken canister with arguments corresponding to the document type, user principal, category, and course. Example arguments:
    ```json
    {
      "document_type": "Certificate", // now only Certificate allows
      "user_principal": "user-principal-from-internet-identity", // set Internet Identity principal of the your graduate here
      "category": "Motoko", // Category, e.g. Motoko
      "course": "Basic Motoko", // Course title, e.g. Basic Motoko
    }
    ```
This invocation will result in the issuance of a certificate in ICRC-7 NFT format, giving the specified user 10 reputation points in the specified category.

## ICRC-7 Specification

For standard methods and structures documentation, read the [specifications](https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-7/ICRC-7.md).

### Deployment
For deployment to mainnet of Internet Computer use: 
*If necessary, enter your information in the Name, Symbol, and Description fields in /commands/deploy-ic.sh.*

<code>
	cd commands
	sh ./deploy-ic.sh
</code>


### Available methods
All ICRC-7 methods available except icrc7_transfer

Additional method: 

#### addUser (to whitelist)
Add the member to the whitelist for update calls.
The deployer is whitelisted by default.

```candid "Methods" +=
addUser : (principal) -> (bool);
```

#### removeUser (from whitelist)
Remove the principal from the whitelist.
The last user will not be deleted.

```candid "Methods" +=
removeUser : (principal) -> (bool);
```

#### burn
```candid "Methods" +=
burn : (TransferArgs) -> (variant { Ok: nat; Err: TransferError; });
```

```candid "Type definitions" +=
type Subaccount = blob;

type Account = record {
		owner: principal; 
		subaccount: opt blob;
  };
  
type TransferArgs = record {
    spender_subaccount: opt Subaccount; // the subaccount of the caller (used to identify the spender)
    from: opt Account;     /* if supplied and is not caller then is permit transfer, if not supplied defaults to subaccount 0 of the caller principal */
    to: Account;
    token_ids: vec {nat};   
    memo: ?Blob;
    created_at_time: opt nat64;
    is_atomic: opt bool;
  };

type TransferError = variant {
    Unauthorized: record { token_ids: vec (nat) };
    TooOld;
    CreatedInFuture: record { ledger_time: nat };
    Duplicate: record { duplicate_of: nat };
    TemporarilyUnavailable: {};
    GenericError: record { error_code: nat; message: text };
  };
```
