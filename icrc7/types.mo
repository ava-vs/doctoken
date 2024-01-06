import Blob "mo:base/Blob";
import Error "mo:base/Error";
import Nat "mo:base/Nat";
import Nat16 "mo:base/Nat16";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Nat8 "mo:base/Nat8";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";

module {

  public type Subaccount = Blob;

  public type Account = {
    owner : Principal;
    subaccount : ?Blob;
  };

  public type CollectionInitArgs = {
    name : Text;
    symbol : Text;
    royalties : ?Nat16;
    royaltyRecipient : ?Account;
    description : ?Text;
    image : ?Text; //todo https://github.com/dfinity/ICRC/commit/ce839e586a993c051a595bfd8386f5c041d7bf18
    supplyCap : ?Nat;
  };

  public type CollectionMetadata = {
    name : Text;
    symbol : Text;
    royalties : ?Nat16;
    royaltyRecipient : ?Account;
    description : ?Text;
    image : ?Text;
    totalSupply : Nat;
    supplyCap : ?Nat;
  };

  public type SupportedStandard = {
    name : Text;
    url : Text;
  };

  public type TokenId = Nat;

  public type Document = {
    tokenId : TokenId;
    categories : [Text];
    owner : Principal;
    metadata : [(Text, Metadata)];
  };

  public type Metadata = {
    #Nat : Nat;
    #Nat8 : Nat8;
    #Int : Int;
    #Text : Text;
    #Blob : Blob;
    #Bool : Bool;
  };

  public type TokenMetadata = {
    tokenId : TokenId;
    owner : Account;
    categories : [Text];
    metadata : [(Text, Metadata)];
  };

  public type Result<S, E> = {
    #Ok : S;
    #Err : E;
  };

  public type CallError = {
    #Unauthorized;
    #InvalidTokenId;
    #AlreadyExistTokenId;
    #SupplyCapOverflow;
    #InvalidRecipient;
    #GenericError;
  };

  public type MintArgs = {
    to : Account;
    metadata : [(Text, Metadata)];
  };

  public type Reputation = {
    user : Principal;
    reviewer : Principal;
    value : Nat8;
    comment : Text;
    category : Text;
  };

  public type IssueArgs = {
    mint_args : MintArgs;
    topics : [EventField];
    reputation : Reputation;
  };

  public type RepArgs = IssueArgs;

  public type TransferId = Nat;

  public type TransferArgs = {
    spender_subaccount : ?Subaccount; // the subaccount of the caller (used to identify the spender)
    from : ?Account; /* if supplied and is not caller then is permit transfer, if not supplied defaults to subaccount 0 of the caller principal */
    to : Account;
    token_ids : [TokenId];
    // type: leave open for now
    memo : ?Blob;
    created_at_time : ?Nat64;
    is_atomic : ?Bool;
  };

  public type TransferError = {
    #Unauthorized : { token_ids : [TokenId] };
    #TooOld;
    #CreatedInFuture : { ledger_time : Nat64 };
    #Duplicate : { duplicate_of : TransferId };
    #TemporarilyUnavailable : {};
    #GenericError : { error_code : Nat; message : Text };
  };

  public type ApprovalId = Nat;

  public type ApprovalArgs = {
    from_subaccount : ?Subaccount;
    spender : Account; // Approval is given to an ICRC Account
    token_ids : ?[TokenId]; // if no tokenIds given then approve entire collection
    expires_at : ?Nat64;
    memo : ?Blob;
    created_at_time : ?Nat64;
  };

  public type ApprovalError = {
    #Unauthorized : { token_ids : [TokenId] };
    #TooOld;
    #TemporarilyUnavailable : {};
    #GenericError : { error_code : Nat; message : Text };
  };

  public type MintError = {
    #Unauthorized;
    #SupplyCapOverflow;
    #InvalidRecipient;
    #AlreadyExistTokenId;
    #GenericError : { error_code : Nat; message : Text };
  };

  public type MetadataResult = Result<[(Text, Metadata)], CallError>;

  public type OwnerResult = Result<Account, CallError>;

  public type BalanceResult = Result<Nat, CallError>;

  public type TokensOfResult = Result<[TokenId], CallError>;

  public type MintReceipt = Result<TokenId, MintError>;

  // #Ok(TokenId, total user reputation)
  public type IssueReceipt = Result<(TokenId, Nat), MintError>;

  public type TransferReceipt = Result<TransferId, TransferError>;

  public type ApprovalReceipt = Result<ApprovalId, ApprovalError>;

  public type TransferErrorCode = {
    #EmptyTokenIds;
    #DuplicateInTokenIds;
  };

  public type ApproveErrorCode = {
    #SelfApproval;
  };

  public type OperatorApproval = {
    spender : Account;
    memo : ?Blob;
    expires_at : ?Nat64;
  };

  public type TokenApproval = {
    spender : Account;
    memo : ?Blob;
    expires_at : ?Nat64;
  };

  public type TransactionId = Nat;

  //base on https://github.com/dfinity/ICRC-1/tree/roman-icrc3/standards/ICRC-3
  public type Transaction = {
    kind : Text; // "icrc7_transfer" | "mint" ...
    timestamp : Nat64;
    mint : ?{
      to : Account;
      token_ids : [TokenId];
    };
    icrc7_transfer : ?{
      from : Account;
      to : Account;
      spender : ?Account;
      token_ids : [TokenId];
      memo : ?Blob;
      created_at_time : ?Nat64;
    };
    icrc7_approve : ?{
      from : Account;
      spender : Account;
      token_ids : ?[TokenId];
      expires_at : ?Nat64;
      memo : ?Blob;
      created_at_time : ?Nat64;
    };
  };

  public type GetTransactionsArgs = {
    limit : Nat;
    offset : Nat;
    account : ?Account;
  };

  public type GetTransactionsResult = {
    total : Nat;
    transactions : [Transaction];
  };

  public type DocHistoryArgs = {
    user : Principal;
    docId : Nat;
    value : Nat8;
    comment : Text;
  };

  public type EventError = MintError or {
    #TagNotFound : { tag : Text };
    #TemporarilyUnavailable;
    #GenericError : { error_code : Nat; message : Text };
  };

  public type Branch = Nat8;

  public type InstantReputationUpdateEvent = actor {
    getCategories : () -> async [(Text, Text)];
    emitEvent : (Event) -> async Result<[(Text, Text)], Text>;
  };
  public type AwaitingReputationUpdateEvent = actor {
    updateReputation : (Event) -> async Result.Result<[(Text, Text)], Text>;
  };
  public type FeedbackSubmissionEvent = actor {
    feedbackSubmission : (Event) -> async Result.Result<[(Text, Text)], Text>;
  };

  public type Topic = EventFilter;

  public type ReputationChangeRequest = {
    user : Principal;
    reviewer : ?Principal;
    value : ?Nat;
    category : Text;
    timestamp : Nat;
    source : (Text, Nat); // (doctoken_canisterId, documentId)
    comment : ?Text;
    metadata : ?[(Text, Metadata)];
  };

  public type Event = {
    eventType : EventName;
    topics : [EventField];
    details : ?Text;
    reputation_change : ReputationChangeRequest;
    sender_hash : ?Text;
  };

  public type Subscriber = {
    callback : Principal;
    filter : EventFilter;
  };

  public type EventFilter = {
    eventType : ?EventName;
    fieldFilters : [EventField];
  };

  public type EventField = {
    name : Text;
    value : Blob;
  };

  public type EventName = {
    #EmitEvent;
    #InstantReputationUpdateEvent;
    #AwaitingReputationUpdateEvent;
    #FeedbackSubmissionEvent;
    #Unknown;
  };
};
