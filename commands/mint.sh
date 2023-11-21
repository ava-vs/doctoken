dfx canister call icrc7 mint \
"(
  record {
    to = record { owner = principal \"$(dfx identity get-principal)\"; subaccount = null };
    token_id = 1;
    metadata = vec { record { \"image\"; variant { Blob = blob \"data:text/plain;base64,YVZhIERvY3Rva2Vu\" } } }
  }
)"
