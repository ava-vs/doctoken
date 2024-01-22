import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Char "mo:base/Char";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";

actor Echo {

  public func textFromBlob(blob : Blob) : async Text {
    Text.join(",", Iter.map<Nat8, Text>(blob.vals(), Nat8.toText));
  };

  public func blobFromText(t : Text) : async Blob {

    // textToNat8
    // turns "123" into 123
    func textToNat8(txt : Text) : Nat8 {
      var num : Nat32 = 0;
      for (v in txt.chars()) {
        num := num * 10 + (Char.toNat32(v) - 48); // 0 in ASCII is 48
      };
      Nat8.fromNat(Nat32.toNat(num));
    };

    let ts = Text.split(t, #char(','));
    let bytes = Array.map<Text, Nat8>(Iter.toArray(ts), textToNat8);
    Blob.fromArray(bytes);
  };

  public func testing() : async () {
    let u = {
      text = "test";
      num = 1;
    };
    // [Nat8] to text
    var txt : Text = await textFromBlob(to_candid (u));
    // text to blob
    let v : ?(Text, Nat) = from_candid (await blobFromText(txt));
    Debug.print(debug_show (v));
    Debug.print(debug_show (Text.encodeUtf8(txt)));

  };
};
