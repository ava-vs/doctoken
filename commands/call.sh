dfx canister call doctoken --ic createCertificate '(record {
  document_type = "Certificate";
  user_principal = "'$(dfx identity get-principal)'";
  category = "Motoko";
  course = "Basic Motoko";
})'
