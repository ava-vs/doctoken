//libraries
import { HttpAgent } from "@dfinity/agent";
import { Principal } from '@dfinity/principal';
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { Buffer } from "buffer";
import fetch from "isomorphic-fetch";
import axios from "axios";
//canister specific (ICRC-7 SPECIFIC)
import { createActor } from "../declarations/icrc7/index.js";

//just for the example
import { createRequire } from "node:module";

const HOST = "http://127.0.0.1:4943";

async function createMetadata(tokenId) {
	const encoder = new TextEncoder();
	//download image from public url
	const download = await axios.get(`https://internetcomputer.org/img/IC_logo_horizontal.svg`, {
		responseType: 'arraybuffer'
	});
	const downloadToBase64 = Buffer.from(download.data, 'binary').toString('base64');
	const blobContent = encoder.encode(downloadToBase64);

	const metadata = [];
	metadata.push(["name", { Text: `Test Name ${tokenId}` }]);
	metadata.push(["description", { Text: `Test description ${tokenId}` }]);
	metadata.push(["image", { Blob: blobContent }]);

	return metadata;
}

async function main() {

	//alice is the owner of the smart contract
	const aliceSeed = "mother head idle deer harbor more clinic great shock faculty remove usual auto cheap hip omit future sleep remember sting admit chicken vendor shoe";
	const bobSeed = "van mule skill beyond bread close fruit bench frame trade flight three elevator release pizza meadow message present stock act tenant morning tragic harsh";
	const chloeSeed = "fantasy damp hockey item gallery action orient lonely husband broccoli worth rain door special limb tool ticket step crop honey siren bubble heavy pizza";
	const desmondSeed = "act snow enable use valid green razor learn gap subway child finger fit search smile oxygen corn hollow fever tired use rack goat cluster";

	const alicePrincipalString = Secp256k1KeyIdentity.fromSeedPhrase(aliceSeed).getPrincipal().toString();
	const bobPrincipalString = Secp256k1KeyIdentity.fromSeedPhrase(bobSeed).getPrincipal().toString();
	const chloePrincipalString = Secp256k1KeyIdentity.fromSeedPhrase(chloeSeed).getPrincipal().toString();
	const desmondPrincipalString = Secp256k1KeyIdentity.fromSeedPhrase(desmondSeed).getPrincipal().toString();

	const fromPrincipalToActor = {
		[alicePrincipalString]: "Alice",
		[bobPrincipalString]: "Bob",
		[chloePrincipalString]: "Chloe",
		[desmondPrincipalString]: "Desmond",
	}

	// Require syntax is needed for JSON file imports
	const requireUrl = createRequire(import.meta.url);
	const localCanisterIds = requireUrl("../../.dfx/local/canister_ids.json");
	const effectiveCanisterId = localCanisterIds.icrc7.local;

	const aliceAgent = new HttpAgent({
		identity: Secp256k1KeyIdentity.fromSeedPhrase(aliceSeed),
		host: HOST,
		fetch,
	});

	const bobAgent = new HttpAgent({
		identity: Secp256k1KeyIdentity.fromSeedPhrase(bobSeed),
		host: HOST,
		fetch,
	});

	const chloeAgent = new HttpAgent({
		identity: Secp256k1KeyIdentity.fromSeedPhrase(chloeSeed),
		host: HOST,
		fetch,
	});

	const desmondAgent = new HttpAgent({
		identity: Secp256k1KeyIdentity.fromSeedPhrase(desmondSeed),
		host: HOST,
		fetch,
	});

	const aliceActor = createActor(effectiveCanisterId, {
		agent: aliceAgent,
	});

	const bobActor = createActor(effectiveCanisterId, {
		agent: bobAgent,
	});

	const chloeActor = createActor(effectiveCanisterId, {
		agent: chloeAgent,
	});

	const desmondActor = createActor(effectiveCanisterId, {
		agent: desmondAgent,
	});

	const collectionMetadata = await desmondActor.icrc7_collection_metadata();

	console.log(`Collection Metadata Name:`, collectionMetadata.name);
	console.log(`Collection Metadata Symbol:`, collectionMetadata.symbol);
	console.log(`Collection Metadata Description:`, collectionMetadata.description[0]);
	console.log(`Collection Metadata Total Supply:`, collectionMetadata.totalSupply);
	console.log(`Collection Metadata Image:`, collectionMetadata.image[0]);

	const collectionName = await desmondActor.icrc7_name();
	console.log(`Collection Name:`, collectionName);
	const collectionSymbol = await desmondActor.icrc7_symbol();
	console.log(`Collection Symbol:`, collectionSymbol);
	const collectionDescription = await desmondActor.icrc7_description();
	console.log(`Collection Description:`, collectionDescription[0]);
	const collectionTotalSupply = await desmondActor.icrc7_total_supply();
	console.log(`Collection Total Supply:`, collectionTotalSupply);
	const collectionImage = await desmondActor.icrc7_image();
	console.log(`Collection Image:`, collectionImage[0]);

	const metadataToken1 = await createMetadata(1);
	const metadataToken2 = await createMetadata(2);
	const metadataToken3 = await createMetadata(3);
	const metadataToken4 = await createMetadata(4);

	const mintReceipt1 = await aliceActor.mint({ owner: Principal.fromText(bobPrincipalString), subaccount: [] }, 1, metadataToken1);
	console.log(mintReceipt1.Ok ? `Minted successfully token id ${mintReceipt1.Ok}` : `Failed to mint token id 1: ${Object.keys(mintReceipt1.Err)}`);
	const mintReceipt2 = await aliceActor.mint({ owner: Principal.fromText(bobPrincipalString), subaccount: [] }, 2, metadataToken2);
	console.log(mintReceipt2.Ok ? `Minted successfully token id ${mintReceipt2.Ok}` : `Failed to mint token id 2: ${Object.keys(mintReceipt2.Err)}`);
	const mintReceipt3 = await aliceActor.mint({ owner: Principal.fromText(chloePrincipalString), subaccount: [] }, 3, metadataToken3);
	console.log(mintReceipt3.Ok ? `Minted successfully token id ${mintReceipt3.Ok}` : `Failed to mint token id 3: ${Object.keys(mintReceipt3.Err)}`);
	const mintReceipt4 = await aliceActor.mint({ owner: Principal.fromText(chloePrincipalString), subaccount: [] }, 4, metadataToken4);
	console.log(mintReceipt4.Ok ? `Minted successfully token id ${mintReceipt4.Ok}` : `Failed to mint token id 4: ${Object.keys(mintReceipt4.Err)}`);

	const totalSupply = await desmondActor.icrc7_total_supply();
	console.log(`Total supply is ${totalSupply}`);

	let ownerOf1 = await desmondActor.icrc7_owner_of(1);
	console.log(`Owner of token id ${1} is ${fromPrincipalToActor[ownerOf1.Ok?.owner?.toString()]}`);
	let ownerOf2 = await desmondActor.icrc7_owner_of(2);
	console.log(`Owner of token id ${2} is ${fromPrincipalToActor[ownerOf2.Ok?.owner?.toString()]}`);
	let ownerOf3 = await desmondActor.icrc7_owner_of(3);
	console.log(`Owner of token id ${3} is ${fromPrincipalToActor[ownerOf3.Ok?.owner?.toString()]}`);
	let ownerOf4 = await desmondActor.icrc7_owner_of(4);
	console.log(`Owner of token id ${4} is ${fromPrincipalToActor[ownerOf4.Ok?.owner?.toString()]}`);

	let balanceOfBob = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(bobPrincipalString), subaccount: [] });
	console.log(`Balance of Bob is ${balanceOfBob.Ok}`);
	let balanceOfChloe = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(chloePrincipalString), subaccount: [] });
	console.log(`Balance of Chloe is ${balanceOfChloe.Ok}`);
	let balanceOfDesmond = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(desmondPrincipalString), subaccount: [] });
	console.log(`Balance of Desmond is ${balanceOfDesmond.Ok}`);

	let tokensOfBob = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(bobPrincipalString), subaccount: [] });
	console.log(`Tokens of Bob are ${tokensOfBob.Ok}`);
	let tokensOfChloe = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(chloePrincipalString), subaccount: [] });
	console.log(`Tokens of Chloe are ${tokensOfChloe.Ok}`);
	let tokensOfDesmond = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(desmondPrincipalString), subaccount: [] });
	console.log(`Tokens of Desmond are ${tokensOfDesmond.Ok}`);

	//transfer token 1 from Bob to Chloe
	console.log(`\n`);
	console.log(`----------------------------------------------`);
	console.log(`Transfer Token 1 from Bob to Chloe`);
	ownerOf1 = await desmondActor.icrc7_owner_of(1);
	console.log(`Before transfer token id ${1} belongs to ${fromPrincipalToActor[ownerOf1.Ok?.owner?.toString()]}`);
	let transfer1Resp = await bobActor.icrc7_transfer({
		spender_subaccount: [],
		from: [{ owner: Principal.fromText(bobPrincipalString), subaccount: [] }],
		to: { owner: Principal.fromText(chloePrincipalString), subaccount: [] },
		token_ids: [1],
		memo: [],
		created_at_time: [(new Date).getTime() * 1000 * 1000],
		is_atomic: []
	});
	if (transfer1Resp.Err) {
		console.warn(`Failed to transfer token id ${1}: ${Object.keys(transfer1Resp)}`);
	} else {
		console.log(`Transaction id ${transfer1Resp.Ok}`);
	}
	ownerOf1 = await desmondActor.icrc7_owner_of(1);
	console.log(`After transfer token id ${1} belongs to ${fromPrincipalToActor[ownerOf1.Ok?.owner?.toString()]}`);
	tokensOfBob = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(bobPrincipalString), subaccount: [] });
	console.log(`Tokens of Bob are ${tokensOfBob.Ok}`);
	tokensOfChloe = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(chloePrincipalString), subaccount: [] });
	console.log(`Tokens of Chloe are ${tokensOfChloe.Ok}`);
	balanceOfBob = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(bobPrincipalString), subaccount: [] });
	console.log(`Balance of Bob is ${balanceOfBob.Ok}`);
	balanceOfChloe = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(chloePrincipalString), subaccount: [] });
	console.log(`Balance of Chloe is ${balanceOfChloe.Ok}`);

	//transfer token 2 from Bob to Chloe
	console.log(`\n`);
	console.log(`----------------------------------------------`);
	console.log(`Transfer Token 2 from Bob to Chloe`);
	ownerOf2 = await desmondActor.icrc7_owner_of(2);
	console.log(`Before transfer token id ${2} belongs to ${fromPrincipalToActor[ownerOf2.Ok?.owner?.toString()]}`);
	let transfer2Resp = await bobActor.icrc7_transfer({
		spender_subaccount: [],
		from: [],
		to: { owner: Principal.fromText(chloePrincipalString), subaccount: [] },
		token_ids: [2],
		memo: [],
		created_at_time: [(new Date).getTime() * 1000 * 1000],
		is_atomic: []
	});
	if (transfer2Resp.Err) {
		console.warn(`Failed to transfer token id ${2}: ${Object.keys(transfer2Resp)}`);
	} else {
		console.log(`Transaction id ${transfer2Resp.Ok}`);
	}
	ownerOf2 = await desmondActor.icrc7_owner_of(2);
	console.log(`After transfer token id ${2} belongs to ${fromPrincipalToActor[ownerOf2.Ok?.owner?.toString()]}`);
	tokensOfBob = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(bobPrincipalString), subaccount: [] });
	console.log(`Tokens of Bob are ${tokensOfBob.Ok}`);
	tokensOfChloe = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(chloePrincipalString), subaccount: [] });
	console.log(`Tokens of Chloe are ${tokensOfChloe.Ok}`);
	balanceOfBob = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(bobPrincipalString), subaccount: [] });
	console.log(`Balance of Bob is ${balanceOfBob.Ok}`);
	balanceOfChloe = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(chloePrincipalString), subaccount: [] });
	console.log(`Balance of Chloe is ${balanceOfChloe.Ok}`);

	//fail transfer token 3 from Bob to Chloe
	console.log(`\n`);
	console.log(`----------------------------------------------`);
	console.log(`Fail to Transfer Token 3 from Bob to Chloe`);
	ownerOf3 = await desmondActor.icrc7_owner_of(3);
	console.log(`Before transfer token id ${3} belongs to ${fromPrincipalToActor[ownerOf3.Ok?.owner?.toString()]}`);
	let transfer3Resp = await bobActor.icrc7_transfer({
		spender_subaccount: [],
		from: [],
		to: { owner: Principal.fromText(desmondPrincipalString), subaccount: [] },
		token_ids: [1],
		memo: [],
		created_at_time: [(new Date).getTime() * 1000 * 1000],
		is_atomic: []
	});
	if (transfer3Resp.Err) {
		console.log(`Failed to transfer token id ${3}: ${Object.keys(transfer3Resp)}`);
	} else {
		console.warn(`Transaction id ${transfer3Resp.Ok}`);
	}
	ownerOf3 = await desmondActor.icrc7_owner_of(3);
	console.log(`After transfer token id ${3} belongs to ${fromPrincipalToActor[ownerOf3.Ok?.owner?.toString()]}`);
	tokensOfBob = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(bobPrincipalString), subaccount: [] });
	console.log(`Tokens of Bob are ${tokensOfBob.Ok}`);
	tokensOfChloe = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(chloePrincipalString), subaccount: [] });
	console.log(`Tokens of Chloe are ${tokensOfChloe.Ok}`);
	tokensOfDesmond = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(desmondPrincipalString), subaccount: [] });
	console.log(`Tokens of Desmond are ${tokensOfDesmond.Ok}`);
	balanceOfBob = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(bobPrincipalString), subaccount: [] });
	console.log(`Balance of Bob is ${balanceOfBob.Ok}`);
	balanceOfChloe = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(chloePrincipalString), subaccount: [] });
	console.log(`Balance of Chloe is ${balanceOfChloe.Ok}`);
	balanceOfDesmond = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(desmondPrincipalString), subaccount: [] });
	console.log(`Balance of Desmond is ${balanceOfDesmond.Ok}`);

	//fail transfer token 3 from Bob to Chloe
	console.log(`\n`);
	console.log(`----------------------------------------------`);
	console.log(`Fail to Transfer Token 3 from Bob to Chloe`);
	ownerOf3 = await desmondActor.icrc7_owner_of(3);
	console.log(`Before transfer token id ${3} belongs to ${fromPrincipalToActor[ownerOf3.Ok?.owner?.toString()]}`);
	transfer3Resp = await bobActor.icrc7_transfer({
		spender_subaccount: [],
		from: [{ owner: Principal.fromText(bobPrincipalString), subaccount: [] }],
		to: { owner: Principal.fromText(desmondPrincipalString), subaccount: [] },
		token_ids: [1],
		memo: [],
		created_at_time: [(new Date).getTime() * 1000 * 1000],
		is_atomic: []
	});
	if (transfer3Resp.Err) {
		console.log(`Failed to transfer token id ${3}: ${Object.keys(transfer3Resp)}`);
	} else {
		console.warn(`Transaction id ${transfer3Resp.Ok}`);
	}
	ownerOf3 = await desmondActor.icrc7_owner_of(3);
	console.log(`After transfer token id ${3} belongs to ${fromPrincipalToActor[ownerOf3.Ok?.owner?.toString()]}`);
	tokensOfBob = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(bobPrincipalString), subaccount: [] });
	console.log(`Tokens of Bob are ${tokensOfBob.Ok}`);
	tokensOfChloe = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(chloePrincipalString), subaccount: [] });
	console.log(`Tokens of Chloe are ${tokensOfChloe.Ok}`);
	tokensOfDesmond = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(desmondPrincipalString), subaccount: [] });
	console.log(`Tokens of Desmond are ${tokensOfDesmond.Ok}`);
	balanceOfBob = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(bobPrincipalString), subaccount: [] });
	console.log(`Balance of Bob is ${balanceOfBob.Ok}`);
	balanceOfChloe = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(chloePrincipalString), subaccount: [] });
	console.log(`Balance of Chloe is ${balanceOfChloe.Ok}`);
	balanceOfDesmond = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(desmondPrincipalString), subaccount: [] });
	console.log(`Balance of Desmond is ${balanceOfDesmond.Ok}`);

	//approve of token 1 from chloe to bob
	console.log(`\n`);
	console.log(`----------------------------------------------`);
	console.log(`Approving token 1 From Chloe to Bob`);
	ownerOf1 = await desmondActor.icrc7_owner_of(1);
	console.log(`Before approve token id ${1} belongs to ${fromPrincipalToActor[ownerOf1.Ok?.owner?.toString()]}`);
	let approve1Resp = await chloeActor.icrc7_approve({
		from_subaccount: [],
		spender: { owner: Principal.fromText(bobPrincipalString), subaccount: [] },
		token_ids: [[1]],
		expires_at: [],
		memo: [],
		created_at_time: [(new Date).getTime() * 1000 * 1000],
	});
	if (approve1Resp.Err) {
		console.warn(`Failed to approve token id ${1}: ${Object.keys(approve1Resp)}`);
	} else {
		console.log(`Approve id ${approve1Resp.Ok}`);
	}
	ownerOf1 = await desmondActor.icrc7_owner_of(1);
	console.log(`After approve token id ${1} belongs to ${fromPrincipalToActor[ownerOf1.Ok?.owner?.toString()]}`);
	
	console.log(`\n`);
	console.log(`----------------------------------------------`);
	console.log(`Failed transfer of token 1 From Chloe to Desmond by Desmond`);
	//failed transfer from chloe to desmond (transferred by desmond)
	ownerOf1 = await desmondActor.icrc7_owner_of(1);
	console.log(`Before transfer token id ${1} belongs to ${fromPrincipalToActor[ownerOf3.Ok?.owner?.toString()]}`);
	transfer1Resp = await desmondActor.icrc7_transfer({
		spender_subaccount: [],
		from: [{ owner: Principal.fromText(chloePrincipalString), subaccount: [] }],
		to: { owner: Principal.fromText(desmondPrincipalString), subaccount: [] },
		token_ids: [1],
		memo: [],
		created_at_time: [(new Date).getTime() * 1000 * 1000],
		is_atomic: []
	});
	if (transfer1Resp.Err) {
		console.log(`Failed to transfer token id ${1}: ${Object.keys(transfer1Resp)}`);
	} else {
		console.warn(`Transaction id ${transfer1Resp.Ok}`);
	}
	ownerOf1 = await desmondActor.icrc7_owner_of(1);
	console.log(`After transfer token id ${1} belongs to ${fromPrincipalToActor[ownerOf1.Ok?.owner?.toString()]}`);
	tokensOfBob = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(bobPrincipalString), subaccount: [] });
	console.log(`Tokens of Bob are ${tokensOfBob.Ok}`);
	tokensOfChloe = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(chloePrincipalString), subaccount: [] });
	console.log(`Tokens of Chloe are ${tokensOfChloe.Ok}`);
	tokensOfDesmond = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(desmondPrincipalString), subaccount: [] });
	console.log(`Tokens of Desmond are ${tokensOfDesmond.Ok}`);
	balanceOfBob = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(bobPrincipalString), subaccount: [] });
	console.log(`Balance of Bob is ${balanceOfBob.Ok}`);
	balanceOfChloe = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(chloePrincipalString), subaccount: [] });
	console.log(`Balance of Chloe is ${balanceOfChloe.Ok}`);
	balanceOfDesmond = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(desmondPrincipalString), subaccount: [] });
	console.log(`Balance of Desmond is ${balanceOfDesmond.Ok}`);

	//transfer from chloe to desmond (transferred by bob)
	console.log(`\n`);
	console.log(`----------------------------------------------`);
	console.log(`Transfer of token 1 From Chloe to Desmond by Bob`);
	ownerOf1 = await desmondActor.icrc7_owner_of(1);
	console.log(`Before transfer token id ${1} belongs to ${fromPrincipalToActor[ownerOf3.Ok?.owner?.toString()]}`);
	transfer1Resp = await bobActor.icrc7_transfer({
		spender_subaccount: [],
		from: [{ owner: Principal.fromText(chloePrincipalString), subaccount: [] }],
		to: { owner: Principal.fromText(desmondPrincipalString), subaccount: [] },
		token_ids: [1],
		memo: [],
		created_at_time: [(new Date).getTime() * 1000 * 1000],
		is_atomic: []
	});
	if (transfer1Resp.Err) {
		console.warn(`Failed to transfer token id ${1}: ${Object.keys(transfer1Resp)}`);
	} else {
		console.log(`Transaction id ${transfer1Resp.Ok}`);
	}
	ownerOf1 = await desmondActor.icrc7_owner_of(1);
	console.log(`After transfer token id ${1} belongs to ${fromPrincipalToActor[ownerOf1.Ok?.owner?.toString()]}`);
	tokensOfBob = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(bobPrincipalString), subaccount: [] });
	console.log(`Tokens of Bob are ${tokensOfBob.Ok}`);
	tokensOfChloe = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(chloePrincipalString), subaccount: [] });
	console.log(`Tokens of Chloe are ${tokensOfChloe.Ok}`);
	tokensOfDesmond = await desmondActor.icrc7_tokens_of({ owner: Principal.fromText(desmondPrincipalString), subaccount: [] });
	console.log(`Tokens of Desmond are ${tokensOfDesmond.Ok}`);
	balanceOfBob = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(bobPrincipalString), subaccount: [] });
	console.log(`Balance of Bob is ${balanceOfBob.Ok}`);
	balanceOfChloe = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(chloePrincipalString), subaccount: [] });
	console.log(`Balance of Chloe is ${balanceOfChloe.Ok}`);
	balanceOfDesmond = await desmondActor.icrc7_balance_of({ owner: Principal.fromText(desmondPrincipalString), subaccount: [] });
	console.log(`Balance of Desmond is ${balanceOfDesmond.Ok}`);

}

main();