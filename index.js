var florincoin = require('node-litecoin');
var request = require('request');
var jsonpatch = require('fast-json-patch');
var jsonpack = require('jsonpack/main');
var client;

function LibraryDJS(args){
	this.client = new florincoin.Client({
		host: args.host,
		port: args.port,
		user: args.username, 
		pass: args.password
	});
}

// Accepts information in the following format: {"name": "Test Publisher", "address": "FLO Address"}
LibraryDJS.prototype.signPublisher = function(args, callback){
	// Check if the callback is being passed in as args
	if (!args || typeof args === "function"){
		callback = args;
		callback(generateResponseMessage(false, 'You must submit information in the following format: {"name": "Test Publisher", "address": "FLO Address"}'));
		return;
	}

	if (!args.name){
		callback(generateResponseMessage(false, 'You must include the publisher address and the publisher name as arguments. {"name": "Test Publisher", "address": "FLO Address"}'))
	}

	if (!args.address){
		callback(generateResponseMessage(false, 'You must include the publisher address and the publisher name as arguments. {"name": "Test Publisher", "address": "FLO Address"}'))
	}

	// http://api.alexandria.io/#sign-publisher-announcement-message
	// Publisher Name - Address - UNIX Timestamp
	var toSign = args.name + "-" + args.address + "-" + Math.floor((new Date).getTime()/1000);
	
	signMessage(args.address, toSign, function(data){
		callback(data);
	});
}

// Accepts information in the following format: {"name": "Test Publisher", "address": "FLO Address"}
LibraryDJS.prototype.signArtifact = function(args, callback){
	// Check if the callback is being passed in as args
	if (!args || typeof args === "function"){
		callback = args;
		callback(generateResponseMessage(false, 'You must submit information in the following format: {"ipfs": "IPFS Location Hash", "address": "FLO Address"}'));
		return;
	}

	if (!args.ipfs){
		callback(generateResponseMessage(false, 'You must include the publisher address and the publisher name as arguments. {"ipfs": "IPFS Location Hash", "address": "FLO Address"}'))
	}

	if (!args.address){
		callback(generateResponseMessage(false, 'You must include the publisher address and the publisher name as arguments. {"ipfs": "IPFS Location Hash", "address": "FLO Address"}'))
	}

	// http://api.alexandria.io/#sign-publisher-announcement-message
	// IPFS Location Hash - Address - UNIX Timestamp
	var toSign = args.ipfs + "-" + args.address + "-" + Math.floor((new Date).getTime()/1000);
	
	signMessage(args.address, toSign, function(signature){
		callback(signature);
	});
}

// Accepts information in the following format: {"alexandria-publisher":{"name":"Publisher Name","address":"FLO Address","emailmd5":"","bitmessage":""} }
LibraryDJS.prototype.announcePublisher = function(args, callback){
	var errorString = 'You must submit information in the following format: {"alexandria-publisher":{"name":"Publisher Name","address":"FLO Address","emailmd5":"","bitmessage":""} }';
	// Check if the callback is being passed in as args
	if (!args || typeof args === "function"){
		callback = args;
		callback(generateResponseMessage(false, errorString));
		return;
	}

	// Validate that information is being submitted correctly.
	if (!args['alexandria-publisher']){
		callback(generateResponseMessage(false, errorString))
		return;
	}

	var publisher = args['alexandria-publisher'];

	if (!publisher.name){
		callback(generateResponseMessage(false, 'You must include the publisher name! ' + errorString));
		return;
	}

	if (!publisher.address){
		callback(generateResponseMessage(false, 'You must include the publisher address! ' + errorString));
		return;
	}



	// http://api.alexandria.io/#sign-publisher-announcement-message
	// Publisher Name - Address - UNIX Timestamp
	var toSign = args.name + "-" + args.address + "-" + Math.floor((new Date).getTime()/1000);
	
	signMessage(args.address, toSign, function(signature){
		callback(signature);
	});
}

// Accepts information in the format OIP-041
LibraryDJS.prototype.publishArtifact = function(oipArtifact, callback){
	// Check if the callback is being passed in as args
	if (!oipArtifact || typeof oipArtifact === "function"){
		callback = oipArtifact;
		callback(generateResponseMessage(false, 'You must submit information in the OIP-041 format'));
		return;
	}

	// If the artifact verifies correctly it will contain no text, if it fails it will have an error.
	var verify = verifyArtifact(oipArtifact);
	// Check if there is an error
	if (verify){
		callback(verify);
		return;
	}

	// http://api.alexandria.io/#sign-publisher-announcement-message
	// IPFS - Address - UNIX Timestamp
	var toSign = oipArtifact.artifact.storage.location + "-" + oipArtifact.artifact.publisher + "-" + oipArtifact.artifact.timestamp;
	
	var libraryd = this;
	// Sign the message
	libraryd.signMessage(oipArtifact.artifact.publisher, toSign, function(res){
		if (!res.success){
			callback(res);
			return;
		}
		// Attach signature
		oipArtifact.signature = res.message;
		// Above we remove the "oip-041" for ease of use, this adds it back in.
		libraryd.sendToBlockChain(oipArtifact, oipArtifact.artifact.publisher, function(response){
			callback(response);
		})
	});
}

// Accepts information in the format OIP-041-Artifact and OIP-041-Edit
LibraryDJS.prototype.editArtifact = function(oipArtifact, callback){
	// Check if the callback is being passed in as args
	if (!oipArtifact || typeof oipArtifact === "function"){
		callback = oipArtifact;
		callback(generateResponseMessage(false, 'You must submit information in the OIP-041 format'));
		return;
	}
	// Make sure we don't crash :)
	if (typeof oipArtifact == "string"){
		// Test to see if the artifact is valid JSON
		try {
			oipArtifact = JSON.parse(oipArtifact);
		} catch (e) {
			callback(generateResponseMessage(false, "Artifact is not valid JSON"));
		}
	}
	// Check if it is an edit or artifact format.
	if (oipArtifact['oip-041'].edit){
		// IPFS - Address - UNIX Timestamp
		var toSign = oipArtifact.artifact.storage.location + "-" + oipArtifact.artifact.publisher + "-" + oipArtifact.artifact.timestamp;
		
		// Sign the message
		libraryd.signMessage(oipArtifact.artifact.publisher, toSign, function(res){
			if (!res.success){
				callback(res);
				return;
			}
			// Attach signature
			oipArtifact.signature = res.message;
			// Above we remove the "oip-041" for ease of use, this adds it back in.
			var reformattedOIP = { "oip-041": oipArtifact }
			libraryd.sendToBlockChain(reformattedOIP, oipArtifact.artifact.publisher, function(response){
				callback(response);
				return;
			})
		});
	}
	// If the artifact verifies correctly it will contain no text, if it fails it will have an error.
	var verify = this.verifyArtifact(oipArtifact);
	// Check if there is an error
	if (verify){
		callback(verify);
		return;
	}

	if (!oipArtifact['oip-041'].artifact.txid){
		return generateResponseMessage(false, "artifact.txid is a required field when editting! Please submit the TXID of the artifact you wish to edit.");
	}

	var libraryd = this;
	// Get the original artifact
	libraryd.getArtifact(oipArtifact['oip-041'].artifact.txid, function(response){
		if (typeof response == "string"){
			// Test to see if the artifact is valid JSON
			try {
				response = JSON.parse(response);
			} catch (e) {
				callback(generateResponseMessage(false, "Artifact is not valid JSON"));
			}
		}

		// Check if response is successful
		if (!response.success){
			callback(response);
			return;
		}

		var oldArtifact = response.message;

		// Check if the TX is OIP-041, only supports edits for that currently
		if (!response.message['oip-041']){
			callback(generateResponseMessage(false, "Unable to edit artifacts that are not OIP-041"));
			return;
		}

		// Remove the txid, we don't want to publish that
		var oldTX = oipArtifact['oip-041'].artifact.txid;
		delete oipArtifac['oip-041'].artifact.txid;

		// Get the edit format
		var oipEdit = libraryd.generateEditDiff(response.message, oipArtifact, oipArtifact['oip-041'].artifact.txid);

		// Generate the MD5 Hash 
		var patch = oipEdit['oip-041'].edit.patch;
		var patchHash = patch;
		crypto.createHash('md5').update(patchHash).digest("hex");

		console.log(patchHash);

		// http://api.alexandria.io/#sign-publisher-announcement-message
		// Old TXID - MD5 Hash of Patch - UNIX Timestamp
		var toSign = oipArtifact['oip-041'].artifact.txid + "-" + patchHash + "-" + oipArtifact['oip-041'].artifact.timestamp;
		
		console.log(toSign);
		console.log(oipEdit);
		// Sign the message
		/*libraryd.signMessage(oipArtifact.artifact.publisher, toSign, function(res){
			if (!res.success){
				callback(res);
				return;
			}
			// Attach signature
			oipArtifact.signature = res.message;
			// Above we remove the "oip-041" for ease of use, this adds it back in.
			var reformattedOIP = { "oip-041": oipArtifact }
			libraryd.sendToBlockChain(reformattedOIP, oipArtifact.artifact.publisher, function(response){
				callback(response);
			})
		});*/
	})
}

LibraryDJS.prototype.signMessage = function(address, toSign, callback){
	try {
		this.client.signMessage(address, toSign, function(err, signature) {
			if (err){
				callback(generateResponseMessage(false, "Error signing message: " + err));
				console.log(generateResponseMessage(false, "Error signing message: " + err));
				return;
			}
			// Return the signature
			callback(generateResponseMessage(true, signature));
		});
	} catch (e) {
		callback(generateResponseMessage(false, "Error signing publisher message: " + e));
		console.log(generateResponseMessage(false, "Error signing publisher message: " + e));
	}
}

// callback is (errorString, txIDs Array)
LibraryDJS.prototype.multiPart = function(txComment, address, callback) {
	var txIDs = [];

	var multiPartPrefix = "alexandria-media-multipart(";

	var chop = this.chopString(txComment);

	var part = 0;
	var max = chop.length - 1;

	// the first reference tx id is always 64 zeros
	var reference = new Array(65).join("0");

	var data = chop[part];
	var preImage = part.toString() + "-" + max.toString() + "-" + address + "-" + reference + "-" + data;

	var libraryd = this;

	libraryd.signMessage(address, preImage, function(response){
		if (!response.success){
			callback(response);
			return;
		}

		var txComment = multiPartPrefix + part.toString() + "," + max.toString() + "," + address + "," + reference + "," + response.message + "):" + data;

		libraryd.client.sendToAddress(address, SEND_AMOUNT, "", "", txComment, function(err, txid) {
			if (err){
				callback(generateResponseMessage(false, "Unable to send funds to address: " + err))
				console.log(err);
				return;
			}
			
			txIDs[txIDs.length] = txid;
			reference = txid;

			libraryd.publishPart(chop, max, 0, reference, address, SEND_AMOUNT, multiPartPrefix, function(response){
				callback(response);
			})
		});
	})
}

var txIDs = [];
LibraryDJS.prototype.publishPart = function(chopPieces, numberOfPieces, lastPiecesCompleted, reference, address, amount, multiPartPrefix, callback){
	// Increment the number of completed pieces
	var part = lastPiecesCompleted + 1;

	// Chop the next section of data to sign
	var data = chopPieces[part];
	var preImage = part.toString() + "-" + numberOfPieces.toString() + "-" + address + "-" + reference + "-" + data;

	// Generate signature
	var libraryd = this;
	libraryd.signMessage(address, preImage, function(res){
		if (!res.success){
			callback(res)
			console.log(res);
			return;
		}
		var multiPart = multiPartPrefix + part.toString() + "," + numberOfPieces.toString() + "," + address + "," + reference + "," + res.message + "):" + data;

		libraryd.client.sendToAddress(address, SEND_AMOUNT, "", "", multiPart, function(err, txid) {
			if (err){
				callback(generateResponseMessage(false, "Unable to send funds to address: " + err))
				console.log(err);
				return;
			}

			// Store the txid from the just sent transaction.
			txIDs[txIDs.length] = txid;

			// Check if we are done with publishing
			if (part < numberOfPieces){
				// Recurse back in.
				libraryd.publishPart(chopPieces, numberOfPieces, part, reference, address, amount, multiPartPrefix, callback);
			} else {
				// We are done! Callback time.
				callback(generateResponseMessage(true, txIDs));
				// Clear out the txIDs
				txIDs = [];
			}
		});
	});
}

LibraryDJS.prototype.chopString = function(input) {
	input = input.toString();

	var chunks = [];
	while (input.length > CHOP_MAX_LEN) {
		chunks[chunks.length] = input.slice(0, CHOP_MAX_LEN);
		input = input.slice(CHOP_MAX_LEN);
	}
	chunks[chunks.length] = input;

	return chunks;
};

LibraryDJS.prototype.sendToBlockChain = function(txComment, address, callback){
	// Make sure that it is a string and not JSON object.
	if (typeof txComment != "string"){
		// If JSON object then convert to string.
		txComment = JSON.stringify(txComment);
	}
	// Check comment length.
	if (txComment.length > (CHOP_MAX_LEN * 10)) {
		callback(generateResponseMessage(false, "txComment is too large to fit within 10 multipart transactions. Try making it smaller!"));
	}
	else if (txComment.length > TXCOMMENT_MAX_LEN) {
		this.multiPart(txComment, address, callback);
	}
	else {
		this.client.sendToAddress(address, SEND_AMOUNT, "", "", txComment, function(err, txid) {
			if (err){
				callback(generateResponseMessage(false, "Unable to send funds to address: " + err))
				console.log(err);
				return;
			}
			callback(generateResponseMessage(true, [txid]));
		});
	}
}

LibraryDJS.prototype.generateEditDiff = function(originalArtifact, updatedArtifact, origTXID){
	if (!originalArtifact || !updatedArtifact)
		return generateResponseMessage(false, "You are missing either the original artifact or the updated artifact");
	// Check if the original artifact is actually just the transaction ID for the original artifact
	if (originalArtifact.length == TX_LENGTH)
		return generateResponseMessage(false, "You just submit the original artifact JSON, not the TXID. You can get the Artifact JSON by using the getArtifact function.");

	var oaVerify = this.verifyArtifact(originalArtifact);
	var uaVerify = this.verifyArtifact(updatedArtifact);

	if (oaVerify || uaVerify){
		if (oaVerify){
			return oaVerify;
		}
		if (uaVerify){
			return uaVerify;
		}
	}

	//console.log(JSON.stringify(originalArtifact));
	//console.log(JSON.stringify(updatedArtifact));

	// http://stackoverflow.com/a/8432188/1232109
	var result = jsonpatch.compare(originalArtifact, updatedArtifact);

	//console.log(result);
	//console.log(jsonpack.pack(result));

	//console.log(JSON.stringify(originalArtifact, true, 4));
	//console.log(JSON.stringify(updatedArtifact, true, 4));
	//console.log(JSON.stringify(squashPatch(result), true, 4));

	var squashed = squashPatch(result);
	//console.log(JSON.stringify(squashed));
	var packed = jsonpack.pack(squashed);
	//console.log(jsonpack.pack(squashed));

	var oip041Edit = {
    "oip-041":{
        "edit":{
            "txid": origTXID,
            "timestamp":updatedArtifact['oip-041'].artifact.timestamp,
            "patch": squashed
        }
    }
}

	return '{"success": true, "message": ' + JSON.stringify(oip041Edit) + '}';
}

LibraryDJS.prototype.getArtifact = function(txid, callback){
	var baseURL = 'https://api.alexandria.io/alexandria/v2/search';
	var options = {
		method: 'POST',
		headers: {},
		url: baseURL,
		body: JSON.stringify({
			'protocol': 'media',
			'search-on': 'txid',
			'search-for': txid
		})
	};

	try {
		request(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				// Grab the result we want.
				var artifacts = JSON.parse(body);

				if (!artifacts.response){
					callback(generateResponseMessage(false, "No artifacts found from your search of TXID "));
					return;
				}

				var artifact = artifacts.response[0];
				var str = JSON.stringify(artifact);

				if (artifacts.status == "success"){
					// We return the message differently here as it hates returning JSON inside JSON for some reason...
					callback('{"success": true, "message": ' + str + '}');
				} else {
					callback(generateResponseMessage(false, "Artifact could not be found."))
				}
			} else {
				callback(generateResponseMessage(false, "Request failed with status: " + response.statusCode + ", with error: " + error));
			}
		});
	} catch (e) {
		// The request failed for some reason, catch to not crash the program.
		callback(generateResponseMessage(false, "POST Request crashed, stack: " + e));
	}
}

LibraryDJS.prototype.verifyArtifact = function(oipArtifact){
	if (!oipArtifact || typeof oipArtifact === "function"){
		return generateResponseMessage(false, 'You must submit information in the OIP-041 format');
	}

	if (typeof oipArtifact == "string"){
		// Test to see if the artifact is valid JSON
		try {
			oipArtifact = JSON.parse(oipArtifact);
		} catch (e) {
			return generateResponseMessage(false, "Artifact is not valid JSON");
		}
	}

	// Test that the artifact has all required fields.
	// Test "oip-041" wrapping/version number
	if (!oipArtifact["oip-041"]){
		return generateResponseMessage(false, "Artifact is not contained in 'oip-041' or is using an unsupported oip schema version.");
	}

	oipArtifact = oipArtifact["oip-041"];
	// Test required fields
	if (!oipArtifact.artifact){
		return generateResponseMessage(false, "You must submit artifact JSON inside oip-041!");
	}
	if (!oipArtifact.artifact.publisher){
		return generateResponseMessage(false, "artifact.publisher is a required field");
	}
	if (!oipArtifact.artifact.timestamp){
		return generateResponseMessage(false, "artifact.timestamp is a required field");
	}

	// Validate timestamp is a number
	if (isNaN(oipArtifact.artifact.timestamp)){
		return generateResponseMessage(false, "artifact.timestamp must be submitted as a number");
	}

	if (!oipArtifact.artifact.type){
		return generateResponseMessage(false, "artifact.type is a required field");
	}

	if (!oipArtifact.artifact.info){
		return generateResponseMessage(false, "artifact.info is a required fieldset");
	}
	if (!oipArtifact.artifact.info.title){
		return generateResponseMessage(false, "artifact.info.title is a required field");
	}
	if (!oipArtifact.artifact.info.description){
		return generateResponseMessage(false, "artifact.info.description is a required field");
	}
	if (!oipArtifact.artifact.info.year){
		return generateResponseMessage(false, "artifact.info.year is a required field");
	}

	// Validate year is a number
	if (isNaN(oipArtifact.artifact.info.year)){
		return generateResponseMessage(false, "artifact.info.year must be submitted as a number");
	}

	if (!oipArtifact.artifact.storage){
		return generateResponseMessage(false, "artifact.storage is a required fieldset");
	}
	if (!oipArtifact.artifact.storage.network){
		return generateResponseMessage(false, "artifact.storage.network is a required field");
	}

	// Currently the storage location is a required field. This however can be "hidden" using LibraryD so that you can serve the IPFS file location via an API (for example, that detects payments)
	if (!oipArtifact.artifact.storage.location){
		return generateResponseMessage(false, "artifact.storage.location is a required field (Talk with Alexandria if you need to hide this field from being published in LibraryD)");
	}

	// Default return nothing.
	return;
}

function squashPatch(patch){
	var squashed = {
		"add": [],
		"replace": [],
		"remove": []
	}
	for (var i = 0; i < patch.length; i++) {
		// Store the operation
		var operation = patch[i].op;
		// Remove operation key from squashed patch
		delete patch[i].op;
		// Edit the path to be shorter, unless it is the signature.
		patch[i].path = patch[i].path.replace("/oip-041/artifact", "");
		// Check what the operation is, and move it to the right place
		if (operation == "add")
			squashed.add.push(patch[i]);
		else if (operation == "replace")
			squashed.replace.push(patch[i]);
		else if (operation == "remove")
			squashed.remove.push(patch[i]);
	}
	return squashed;
}

function generateResponseMessage(success, message) {
	try {
		return JSON.parse('{ "success": ' + success + (success ? ', "message": "' : ', "error": "') + message + '"}');
	} catch(e) {
		console.log(e);
		return '{"success": false, "error": "Error generating response message"}';
	}
}

const CHOP_MAX_LEN = 270;
const TXCOMMENT_MAX_LEN = 528;
const SEND_AMOUNT = 0.0001;
const TX_LENGTH = 64;

module.exports = LibraryDJS;