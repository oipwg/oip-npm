[![npm version](https://badge.fury.io/js/oip-npm.svg)](https://badge.fury.io/js/oip-npm)
# OIP-NPM
OIP-NPM is an easy to use Node.js module to help with publishing to OIP media formats. It publishes the OIP metadata to the Florincoin blockchain using [predefined metadata templates](https://github.com/dloa/media-protocol).

## Installation
Import OIP-NPM into your existing application using the following below.
```
$ npm install oip-npm --save
```

# Usage
## Starting Off
To start off, you will need to import LibaryDJS into your application, then set it up using the example below.
```javascript
var oip041 = require('oip-npm');

var oip = new oip041({
     host: 'localhost', # Information about your local Florincoin RPC
     port: 18322,
     username: 'florincoinrpc', 
     password: 'password'
});
```

## Main Functions
### Publish Media:
`publishArtifact(oipArtifact, callback)`: Validates and publishes a submitted OIP-041 artifact:
```javascript
var oip041 = require('oip-npm');

var oip = new oip041({
     host: 'localhost', # Information about your local Florincoin RPC
     port: 18322,
     username: 'florincoinrpc', 
     password: 'password'
});

// The artifact to publish in OIP-041 format.
var artifact = {
  "oip-041": {
    "artifact": {
      "publisher": "FD6qwMcfpnsKmoL2kJSfp1czBMVicmkK1Q",
      "timestamp": 1481419390,
      "type": "music",
      "info": {
        "title": "Test Artifact",
        "description": "Testing publishing from OIP-NPM",
        "year": "2016",
        "extraInfo": {}
      },
      "storage":{
      "network": "IPFS",
      "location": "QmPukCZKeJD4KZFtstpvrguLaq94rsWfBxLU1QoZxvgRxA",
      "files": [
            {
              "dname": "Skipping Stones",
              "fame": "1 - Skipping Stones.mp3",
              "fsize": 6515667,
              "type": "album track",
              "duration": 1533.603293
            }
          ]},
      "payment": {
      }
    }
  }
}

oip.publishArtifact(artifact, function(response){
	if (res.success)
		// Successful
	else
		// Not successful, usually because the submitted JSON is malformed.

	console.log(response);
})
```
After processing the `publishArtifact` function will return a response as follows:
```javascript
{
	"success": true, 					# This variable is set dependant on if the API call was successful or not.
	"message": "tx1,tx2,tx3,tx4,tx5",	# This variable will be filled in on success. If success is false, `error` will be used instead of `message`.
}
```

### Announce Publisher:
`announcePublisher(publisherJSON, callback)`: Changes the ownership of an artifact from your publisher to another user. `transferOwnership` function example:
```javascript
// The artifact txid that we are transfering
var publisherJSON = {"oip-publisher":{"name":"Publisher Name","address":"FLO Address","emailmd5":"","bitmessage":""}};

oip.announcePublisher(originalTX, function(response){
	if (res.success)
		// Successful
	else
		// Not successful, usually because the lack of callback or title.

	console.log(response);
})
```
After processing the `announcePublisher` function will return a response as follows:
```javascript
{
	"success": true, 	# This variable is set dependant on if the API call was successful or not.
	"message": "txid"	# This variable will be filled in on success. If success is false, `error` will be used instead of `message`.
}
```

### Edit Media:
`editArtifact(newOIPArtifact, callback)`: The Edit Artifact function accepts data in the OIP-041 Edit format (example below) along with data in the standard OIP-041 schema (same as `publishArtifact` but with an added `txid` field inside the data at `oip-041.artifact.txid`). It calculates what information is new and publish that to the Florincoin blockchain. Example Edit code:
```javascript
// The artifact txid that we are editting
// The updated artifact in OIP-041 format.
var artifact = {
  "oip-041": {
    "artifact": {
      "txid": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "publisher": "FD6qwMcfpnsKmoL2kJSfp1czBMVicmkK1Q",
      "timestamp": 1481419391,
      "type": "music",
      "info": {
        "title": "Test Artifact (edit)",
        "description": "Testing editting from OIP-NPM",
        "year": "2016",
        "extraInfo": {}
      },
      "storage":{
      "network": "IPFS",
      "location": "QmPukCZKeJD4KZFtstpvrguLaq94rsWfBxLU1QoZxvgRxA",
      "files": [
            {
              "dname": "Skipping Stones",
              "fame": "1 - Skipping Stones.mp3",
              "fsize": 6515667,
              "type": "album track",
              "duration": 1533
            }
          ]},
      "payment": {
      }
    }
  }
}

oip.editArtifact(artifact, originalTX, function(response){
	if (res.success)
		// Successful
	else
		// Not successful, usually because the submitted JSON is malformed.

	console.log(response);
})
```
After processing the `editArtifact` function will return a response in a callback as follows:
```javascript
{
	"success": true, 					# This variable is set dependant on if the API call was successful or not.
	"message": "tx1,tx2,tx3,tx4,tx5",	# This variable will be filled in on success. If success is false, `error` will be used instead of `message`.
}
```

### Remove Media:
`deactivateArtifact(txid, title, callback)`: Deactivates an artifact in LibraryD. This will cause the artifact to stop showing up in the browser, however it does NOT remove the previously published data from the blockchain. Any information previously published will be accessable for as long as Florincoin exists. Example deactivation of an artifact:
```javascript
// The artifact txid that we are editting
var originalTX = "XXXXXXXXXXXXX";
// The updated artifact in OIP-041 format.
var title = "Test Artifact"

oip.deactivateArtifact(originalTX, title, function(response){
	if (res.success)
		// Successful
	else
		// Not successful, usually because the lack of callback or title.

	console.log(response);
})
```
After processing the `deactivateArtifact` API endpoint will return a response as follows:
```javascript
{
	"success": true, 	# This variable is set dependant on if the API call was successful or not.
	"message": "txid"	# This variable will be filled in on success. If success is false, `error` will be used instead of `message`.
}
```

### Transfer Artifact:
`transferArtifact(txid, newOwner, callback)`: Changes the ownership of an artifact from your publisher to another user. `transferArtifact` function example:
```javascript
// The artifact txid that we are transfering
var originalTX = "XXXXXXXXXXXXX";
// Your publisher address
var origOwner = "XXXXXXXXXXXXX";
// The updated artifact in OIP-041 format.
var newOwner = "XXXXXXXXXXXXX"; // This needs to be a florincoin address that is a registered publisher. If it is not a registered publisher it will fail.

oip.transferOwnership(originalTX, origOrner, newOwner, function(response){
	if (res.success)
		// Successful
	else
		// Not successful, usually because the lack of callback or title.

	console.log(response);
})
```
After processing the `transferArtifact` function will return a response as follows:
```javascript
{
	"success": true, 	# This variable is set dependant on if the API call was successful or not.
	"message": "txid"	# This variable will be filled in on success. If success is false, `error` will be used instead of `message`.
}
```


## OIP Artifact Formats
You can find more information about the OIP-041 standard here: https://github.com/dloa/media-protocol

## License
This module uses the MIT License. This can be found inside the file named `LICENSE`