dfx deploy --ic --argument "(
  record {
    owner = principal\"$(dfx identity get-principal)\";
    subaccount = opt blob \"00000000000000000000000000000000\";
  },
  record {
    name = \"Your Doctoken\";
    symbol = \"YOURDCT\";
    royalties = opt 0;
    royaltyRecipient = opt record {
      owner = principal\"2vxsx-fae\";
      subaccount = null;
    };
    description = opt \"Sample doctoken\";
    image = null;
    supplyCap = opt 10000;
  }
)" doctoken
