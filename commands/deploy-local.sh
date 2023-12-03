dfx canister create --all && dfx build && dfx deploy --argument "(
  record {
    owner = principal\"$(dfx identity get-principal)\";
    subaccount = opt blob \"00000000000000000000000000000000\";
  },
  record {
    name = \"Agorapp Doctoken\";
    symbol = \"AGDT\";
    royalties = opt 0;
    royaltyRecipient = opt record {
      owner = principal\"2vxsx-fae\";
      subaccount = null;
    };
    description = opt \"Sample doctoken for Agorapp [AGDT]\";
    image = null;
    supplyCap = opt 10000;
  }
)" doctoken
