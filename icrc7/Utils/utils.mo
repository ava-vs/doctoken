import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import Char "mo:base/Char";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Nat8 "mo:base/Nat8";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

import Types "../types";
import CRC32 "./CRC32";
import SHA224 "./SHA224";

module {
	private let symbols = [
		'0',
		'1',
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'9',
		'a',
		'b',
		'c',
		'd',
		'e',
		'f',
	];
	private let base : Nat8 = 0x10;

	/// Convert bytes array to hex string.
	/// E.g `[255,255]` to "ffff"
	private func encode(array : [Nat8]) : Text {
		Array.foldLeft<Nat8, Text>(
			array,
			"",
			func(accum, u8) {
				accum # nat8ToText(u8);
			},
		);
	};

	/// Convert a byte to hex string.
	/// E.g `255` to "ff"
	private func nat8ToText(u8 : Nat8) : Text {
		let c1 = symbols[Nat8.toNat((u8 / base))];
		let c2 = symbols[Nat8.toNat((u8 % base))];
		return Char.toText(c1) # Char.toText(c2);
	};

	/// Return the account identifier of the Principal.
	public func accountToText(account : Types.Account) : Text {
		let digest = SHA224.Digest();
		digest.write([10, 97, 99, 99, 111, 117, 110, 116, 45, 105, 100] : [Nat8]); // b"\x0Aaccount-id"
		let blob = Principal.toBlob(account.owner);
		digest.write(Blob.toArray(blob));

		let effectiveSubaccount : Blob = switch (account.subaccount) {
			case null Blob.fromArray([]);
			case (?_elem) _elem;
		};

		digest.write(Blob.toArray(effectiveSubaccount)); // subaccount

		let hash_bytes = digest.sum();

		let crc = CRC32.crc32(hash_bytes);
		let aid_bytes = appendArray<Nat8>(crc, hash_bytes);

		return encode(aid_bytes);
	};

	public func pushIntoArray<X>(elem : X, array : [X]) : [X] {
		let buffer = Buffer.fromArray<X>(array);
		buffer.add(elem);
		return Buffer.toArray(buffer);
	};

	public func appendArray<X>(array1 : [X], array2 : [X]) : [X] {
		let buffer1 = Buffer.fromArray<X>(array1);
		let buffer2 = Buffer.fromArray<X>(array2);
		buffer1.append(buffer2);
		Buffer.toArray(buffer1);
	};

	public func nullishCoalescing<X>(elem : ?X, default : X) : X {
		switch (elem) {
			case null return default;
			case (?_elem) return _elem;
		};
	};

	public func compareAccounts(a : Types.Account, b : Types.Account) : {
		#less;
		#equal;
		#greater;
	} {
		return Text.compare(accountToText(a), accountToText(b));
	};

	public func convertMetadataToEventField(metadata : [(Text, Types.Metadata)]) : [Types.EventField] {
		return Array.map<(Text, Types.Metadata), Types.EventField>(
			metadata,
			func((name, value)) {
				let valueBlob = switch (value) {
					case (#Nat(n)) { Text.encodeUtf8(Nat.toText(n)) };
					case (#Nat8(n)) { Text.encodeUtf8(Nat8.toText(n)) };
					case (#Int(i)) { Text.encodeUtf8(Int.toText(i)) };
					case (#Text(t)) { Text.encodeUtf8(t) };
					case (#Blob(b)) { b };
					case (#Bool(b)) {
						if (b) Blob.fromArray([1]) else Blob.fromArray([0]);
					};

				};
				{ name = name; value = valueBlob };
			},
		);
	};

	public func convertMetadataToTextPairs(metadata : [(Text, Types.Metadata)]) : [(Text, Text)] {
		return Array.map<(Text, Types.Metadata), (Text, Text)>(
			metadata,
			func(pair) {
				let (name, value) = pair;
				let valueText = switch (value) {
					case (#Nat(n)) { Nat.toText(n) };
					case (#Nat8(n)) { Nat8.toText(n) };
					case (#Int(i)) { Int.toText(i) };
					case (#Text(t)) { t };
					case (#Blob(b)) { textFromBlob(b) };
					case (#Bool(b)) {
						if (b) "true" else "false";
					};
				};
				(name, valueText);
			},
		);
	};

	public func textToEventName(text : Text) : Types.EventName {
		switch (text) {
			case ("EmitEvent") return #EmitEvent;
			case ("InstantReputationUpdateEvent") return #InstantReputationUpdateEvent;
			case ("AwaitingReputationUpdateEvent") return #AwaitingReputationUpdateEvent;
			case ("FeedbackSubmissionEvent") return #FeedbackSubmissionEvent;

			case (_) #Unknown;
		};
	};
	public func eventNameToText(eventName : Types.EventName) : Text {
		switch (eventName) {
			case (#EmitEvent) return "EmitEvent";
			case (#InstantReputationUpdateEvent) return "InstantReputationUpdateEvent";
			case (#AwaitingReputationUpdateEvent) return "AwaitingReputationUpdateEvent";
			case (#FeedbackSubmissionEvent) return "FeedbackSubmissionEvent";
			case (_) "Unknown";
		};
	};

	public func textFromBlob(blob : Blob) : Text {
		Text.join(",", Iter.map<Nat8, Text>(blob.vals(), Nat8.toText));
	};

	// convert date (Time.now()) from Int to date (dd.mm.yyyy hh:mm:ss)

	public func convertTimestampToDate(timestamp : Int) : Text {
		let year2024 = timestamp - 1_704_067_200_000_000_000;
		let seconds = year2024 / 1_000_000_000;
		let minutes = Int.div(seconds, 60);
		let hours = Int.div(minutes, 60);
		let days = Int.div(hours, 24);

		let secondsInMinute = seconds % 60;
		let minutesInHour = minutes % 60;
		let hoursInDay = hours % 24;

		let years = Int.div(days, 365);
		let year = years + 2024;

		var remainingDays = days - (years * 365);

		let monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		var month = 1;
		label l for (i in monthDays.vals()) {
			if (remainingDays < i) break l;
			remainingDays -= i;
			month += 1;
		};

		let day = Int.toText(remainingDays + 1);

		return Int.toText(year) # "-" # Int.toText(month) # "-" # day # " "
		# Int.toText(hoursInDay) # ":" # Int.toText(minutesInHour)
		# ":" # Int.toText(secondsInMinute);
	};

	public func timestampToDate() : Text {
		let start2024 = Time.now() - 1_704_067_200_000_000_000;
		let seconds = start2024 / 1_000_000_000;
		let minutes = Int.div(seconds, 60);
		let hours = Int.div(minutes, 60);
		let days = Int.div(hours, 24);

		let secondsInMinute = seconds % 60;
		let minutesInHour = minutes % 60;
		let hoursInDay = hours % 24;

		let years = Int.div(days, 365);
		let year = years + 2024;
		var remainingDays = days - (years * 365);

		let monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		var month = 1;
		label l for (i in monthDays.vals()) {
			if (remainingDays < i) break l;
			remainingDays -= i;
			month += 1;
		};

		let day = remainingDays + 1;

		return Int.toText(year) # "-" # Int.toText(month) # "-"
		# Int.toText(day) # " " # Int.toText(hoursInDay) # ":"
		# Int.toText(minutesInHour) # ":" # Int.toText(secondsInMinute);
	};
};
