var florincoin = require('node-litecoin');
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

	if (typeof oipArtifact == "string"){
		// Test to see if the artifact is valid JSON
		try {
			oipArtifact = JSON.parse(oipArtifact);
		} catch (e) {
			callback(generateResponseMessage(false, "Artifact is not valid JSON"));
			return;
		}
	}

	// Test that the artifact has all required fields.
	// Test "oip-041" wrapping/version number
	if (!oipArtifact["oip-041"]){
		callback(generateResponseMessage(false, "Artifact is not contained in 'oip-041' or is using an unsupported oip schema version."));
		return;
	}

	oipArtifact = oipArtifact["oip-041"];
	// Test required fields
	if (!oipArtifact.artifact){
		callback(generateResponseMessage(false, "You must submit artifact JSON inside oip-041!"));
		return;
	}
	if (!oipArtifact.artifact.publisher){
		callback(generateResponseMessage(false, "artifact.publisher is a required field"));
		return;
	}
	if (!oipArtifact.artifact.timestamp){
		callback(generateResponseMessage(false, "artifact.timestamp is a required field"));
		return;
	}

	// Validate timestamp is a number
	if (isNaN(oipArtifact.artifact.timestamp)){
		callback(generateResponseMessage(false, "artifact.timestamp must be submitted as a number"));
		return;
	}

	if (!oipArtifact.artifact.type){
		callback(generateResponseMessage(false, "artifact.type is a required field"));
		return;
	}

	if (!oipArtifact.artifact.info){
		callback(generateResponseMessage(false, "artifact.info is a required fieldset"));
		return;
	}
	if (!oipArtifact.artifact.info.title){
		callback(generateResponseMessage(false, "artifact.info.title is a required field"));
		return;
	}
	if (!oipArtifact.artifact.info.description){
		callback(generateResponseMessage(false, "artifact.info.description is a required field"));
		return;
	}
	if (!oipArtifact.artifact.info.year){
		callback(generateResponseMessage(false, "artifact.info.year is a required field"));
		return;
	}

	// Validate year is a number
	if (isNaN(oipArtifact.artifact.info.year)){
		callback(generateResponseMessage(false, "artifact.info.year must be submitted as a number"));
		return;
	}

	if (!oipArtifact.artifact.storage){
		callback(generateResponseMessage(false, "artifact.storage is a required fieldset"));
		return;
	}
	if (!oipArtifact.artifact.storage.network){
		callback(generateResponseMessage(false, "artifact.storage.network is a required field"));
		return;
	}

	// Currently the storage location is a required field. This however can be "hidden" using LibraryD so that you can serve the IPFS file location via an API (for example, that detects payments)
	if (!oipArtifact.artifact.storage.location){
		callback(generateResponseMessage(false, "artifact.storage.location is a required field (Talk with Alexandria if you need to hide this field from being published in LibraryD)"));
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
		libraryd.sendToBlockChain(oipArtifact, oipArtifact.artifact.publisher, function(response){
			callback(response);
		})
	});
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

function generateResponseMessage(success, message) {
	return JSON.parse('{ "success": ' + success + (success ? ', "message": "' : ', "error": "') + message + '"}');
}

const CHOP_MAX_LEN = 270;
const TXCOMMENT_MAX_LEN = 528;
const SEND_AMOUNT = 0.0001;

module.exports = LibraryDJS;