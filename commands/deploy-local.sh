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
    image = opt blob \"data:image/png;base64,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\";
    supplyCap = opt 10000;
  }
)" icrc7
