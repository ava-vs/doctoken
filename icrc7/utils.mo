import Hash "mo:base/Hash";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Char "mo:base/Char";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Nat8 "mo:base/Nat8";
import SHA224 "./SHA224";
import CRC32 "./CRC32";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Nat32 "mo:base/Nat32";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Types "./types";

module {
	private let symbols = [
			'0', '1', '2', '3', '4', '5', '6', '7',
			'8', '9', 'a', 'b', 'c', 'd', 'e', 'f',
	];
	private let base : Nat8 = 0x10;

	/// Convert bytes array to hex string.       
	/// E.g `[255,255]` to "ffff"
	private func encode(array : [Nat8]) : Text {
			Array.foldLeft<Nat8, Text>(array, "", func (accum, u8) {
					accum # nat8ToText(u8);
			});
	};

	/// Convert a byte to hex string.
	/// E.g `255` to "ff"
	private func nat8ToText(u8: Nat8) : Text {
			let c1 = symbols[Nat8.toNat((u8/base))];
			let c2 = symbols[Nat8.toNat((u8%base))];
			return Char.toText(c1) # Char.toText(c2);
	};

	/// Return the account identifier of the Principal.
	public func accountToText(account : Types.Account) : Text {
		let digest = SHA224.Digest();
		digest.write([10, 97, 99, 99, 111, 117, 110, 116, 45, 105, 100]:[Nat8]); // b"\x0Aaccount-id"
		let blob = Principal.toBlob(account.owner);
		digest.write(Blob.toArray(blob));

		let effectiveSubaccount : Blob = switch (account.subaccount) {
			case null Blob.fromArray([]);
			case (?_elem) _elem;
		};

		digest.write(Blob.toArray(effectiveSubaccount)); // subaccount

		let hash_bytes = digest.sum();

		let crc = CRC32.crc32(hash_bytes);
		let aid_bytes = Array.append<Nat8>(crc, hash_bytes);

		return encode(aid_bytes);
	};

	public func pushIntoArray<X>(elem: X, array: [X]) : [X] {
		let buffer = Buffer.fromArray<X>(array);
    buffer.add(elem);
		return Buffer.toArray(buffer);
	};

	public func nullishCoalescing<X>(elem: ?X, default: X) : X {
		switch(elem) {
      case null return default;
      case (?_elem) return _elem;
    };
	};

	public func compareAccounts(a: Types.Account, b: Types.Account): {#less; #equal; #greater} {
		return Text.compare(accountToText(a), accountToText(b));
	};

};