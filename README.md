# aVa Doctoken (draft ICRC-7 version)

## Overview

aVa Doctoken allows the user to create an NFT document and issue [reputation](https://github.com/ava-vs/reputation/wiki) based on it. Default cost of NFT with reputation set to 750B cycles (~$1).

### Preliminary steps (you need to have [dfx](https://internetcomputer.org/docs/current/developer-docs/setup/install/) installed)
1. **Clone the repository**: Go to [aVa Doctoken Repo](https://github.com/ava-vs/doctoken.git), fork and clone the repository.

2. **Customize the parameters: Edit the `/commands/deploy-ic.sh` file in your copy and adjust the Name, Symbol and Description fields to suit your needs.

3. **Start the Doctoken canister: (Note: You must install [dfx](https://internetcomputer.org/docs/current/developer-docs/setup/install/) and fund your wallet for at least 3.6T cycles to create a canister).  Run the
 ```
cd commands
sh ./deploy-ic.sh
```
 to start the doctoken canister.

 The first certificate will be issued to your principal, and your deployer's Motoko reputation will be set to 120 (rank "Specialist"). 
 
 Congratulations! You have deployed your first doctoken canister!

Save your Doctoken Canister ID. You can view it with the command 
```bash
dfx canister id doctoken --ic
```

#### Issuing Certificates
1. **Get Internet Identity**: Make sure the user you want to issue a certificate to has an Internet Identity identifier. This will be used as the `user_principal'.

2. Call the CreateCertificate method: To create a certificate, call the `createCertificate` method of the doctoken canister (using the `call.sh' script, `dfx canister call' command, frontend call, or inter-canister call) with arguments corresponding to the document type, user principal, category, and course. Example arguments:
    ```json
    {
      "document_type": " Certificate", // now only Certificate is allowed
      "user_principal": "user-principal-from-internet-identity", // set the Internet Identity text id of your graduate here
      "category": "Motoko", // category, e.g. Motoko
      "course": "Basic Motoko", // Course title, e.g. Basic Motoko
    }
    ```
    This command will issue a certificate in ICRC-7 NFT format giving the specified user 10 reputation points in the specified category.

#### Example for the 'dfx canister call' command:

dfx canister call --ic <your-doctoken-canister-id, e.g. 4yplh-laaaa-aaaal-qdfda-cai > createCertificate '(record {
document_type="Certificate"; 
user_principal=<graduate's text id from Internet Identity, ex. "d3gb7-5ya4i-g3bs7-hfmxr-kgpc3-4nlmy-mttop-anqt5-eal7h-lzdvo-...">;
 category="Motoko";
 course="Basic Motoko"})'

4. **Refill your Doctoken canister: Certificate retrieval costs 750B cycles (~$1). Do not forget to refill your Doctoken canister with dfx or special services.

#### Example dfx recharge command:
```bash
dfx ledger --ic top-up <your_doctoken_canister_id> -amount 2
```
where "2" is the amount of ICP tokens.
