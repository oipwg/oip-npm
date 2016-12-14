var LibraryDJS = require('./index.js');
var jsonpack = require('jsonpack/main');

var ldjs = new LibraryDJS({
     host: 'localhost',
     port: 18322,
     username: 'florincoinrpc', 
     password: 'password'
});

var oip041 = {  
    "oip-041":{  
        "artifact":{  
            "publisher":"FD6qwMcfpnsKmoL2kJSfp1czBMVicmkK1Q",
            "timestamp":1481420000,
            "type":"music",
            "info":{  
                "title":"Happy Birthday EP",
                "description":"this is the second organically grown, gluten free album released by Adam B. Levine - contact adam@tokenly.com with questions or comments or discuss collaborations.",
                "year":2016,
                "extraInfo":{  
                    "artist":"Adam B. Levine",
                    "company":"",
                    "composers":[  
                        "Adam B. Levine"
                    ],
                    "copyright":"",
                    "usageProhibitions":"",
                    "usageRights":"",
                    "tags":[  

                    ]
                }
            },
            "storage":{  
                "network":"IPFS",
                "location":"QmPukCZKeJD4KZFtstpvrguLaq94rsWfBxLU1QoZxvgRxA",
                "files":[  
                    {  
                        "dname":"Skipping Stones",
                        "fame":"1 - Skipping Stones.mp3",
                        "fsize":6515667,
                        "type":"album track",
                        "duration":1533.603293,
                        "sugPlay":100,
                        "minPlay":null,
                        "sugBuy":750,
                        "minBuy":500,
                        "promo":10,
                        "retail":15,
                        "ptpFT":10,
                        "ptpDT":20,
                        "ptpDA":50
                    },
                    {  
                        "dname":"Lessons",
                        "fame":"2 - Lessons with intro.mp3",
                        "fsize":6515667,
                        "type":"album track",
                        "duration":1231.155243,
                        "disallowPlay":1,
                        "sugBuy":750,
                        "minBuy":500,
                        "promo":10,
                        "retail":15,
                        "ptpFT":10,
                        "ptpDT":20,
                        "ptpDA":50
                    },
                    {  
                        "dname":"Born to Roam",
                        "fame":"3 - Born to Roam.mp3",
                        "fsize":6515667,
                        "type":"album track",
                        "duration":2374.550714,
                        "sugPlay":100,
                        "minPlay":50,
                        "disallowBuy":1,
                        "promo":10,
                        "retail":15,
                        "ptpFT":10,
                        "ptpDT":20,
                        "ptpDA":50
                    },
                    {  
                        "dname":"Cover Art",
                        "fname":"birthdayepFINAL.jpg",
                        "type":"coverArt",
                        "disallowBuy":1
                    }
                ]
            },
            "payment":{  
                "fiat":"USD",
                "scale":"1000:1",
                "sugTip":[  
                    5,
                    50,
                    100
                ],
                "tokens":{  
                    "mtmcollector":"",
                    "mtmproducer":"",
                    "happybirthdayep":"",
                    "early":"",
                    "ltbcoin":"",
                    "btc":"1GMMg2J5iUKnDf5PbRr9TcKV3R6KfUiB55"
                }
            }
        }
    }
}

var artifactEdit = {  
    "oip-041":{  
        "artifact":{  
            "txid":"d5fa5f01038afb6537ea517fcb107eaaee2a6834997b7b7265f580beaec5a1b4",
            "publisher":"FD6qwMcfpnsKmoL2kJSfp1czBMVicmkK1Q",
            "timestamp":1481420001,
            "type":"music",
            "info":{  
                "title":"Happy Birthday EP",
                "description":"This is the second organically grown, gluten free album released by Adam B. Levine - contact adam@tokenly.com with questions or comments or discuss collaborations.",
                "year":2016,
                "extraInfo":{  
                    "artist":"Adam B. Levine",
                    "company":"",
                    "composers":[  
                        "Adam B. Levine"
                    ],
                    "copyright":"",
                    "usageProhibitions":"",
                    "usageRights":"",
                    "tags":[  

                    ]
                }
            },
            "storage":{  
                "network":"IPFS",
                "location":"QmPukCZKeJD4KZFtstpvrguLaq94rsWfBxLU1QoZxvgRxA",
                "files":[  
                    {  
                        "dname":"Skipping Stones",
                        "fame":"1 - Skipping Stones.mp3",
                        "fsize":6515667,
                        "type":"album track",
                        "duration":1533.603293,
                        "sugPlay":100,
                        "minPlay":null,
                        "minBuy":500,
                        "promo":10,
                        "retail":15,
                        "ptpFT":10,
                        "ptpDT":20,
                        "ptpDA":50
                    },
                    {  
                        "dname":"Lessons",
                        "fame":"2 - Lessons with intro.mp3",
                        "fsize":6515667,
                        "type":"album track",
                        "duration":1231.155243,
                        "disallowPlay":1,
                        "sugBuy":750,
                        "minBuy":500,
                        "promo":10,
                        "retail":15,
                        "ptpFT":10,
                        "ptpDT":20,
                        "ptpDA":50
                    },
                    {  
                        "dname":"Born to Roam",
                        "fame":"3 - Born to Roam.mp3",
                        "fsize":6515667,
                        "type":"album track",
                        "duration":2374.550714,
                        "sugPlay":100,
                        "minPlay":50,
                        "disallowBuy":1,
                        "promo":10,
                        "retail":15,
                        "ptpFT":10,
                        "ptpDT":20,
                        "ptpDA":50
                    },
                    {  
                        "dname":"Cover Art 2",
                        "fname":"birthdayepFirst.jpg",
                        "type":"coverArt",
                        "disallowBuy":1
                    }
                ]
            },
            "payment":{  
                "fiat":"USD",
                "scale":"1000:1",
                "sugTip":[  
                    5,
                    50,
                    100
                ],
                "tokens":{  
                    "mtmcollector":"",
                    "mtcproducer":"",
                    "happybirthdayep":"",
                    "early":"",
                    "ltbcoin":"",
                    "btc":"1GMMg2J5iUKnDf5PbRr9TcKV3R6KfUiB55"
                }
            }
        }
    }
}


//ldjs.editArtifact(editArtifact, function(response){console.log(response)});
//ldjs.getArtifact('d5fa5f01038afb6537ea517fcb107eaaee2a6834997b7b7265f580beaec5a1b4', function(response){console.log(response)});
ldjs.transferArtifact('d5fa5f01038afb6537ea517fcb107eaaee2a6834997b7b7265f580beaec5a1b4', 'FD6qwMcfpnsKmoL2kJSfp1czBMVicmkK1Q', 'FLuiVU5iDQ4a6ztcpBLwBNjBisyY2DvUTV', function(response){console.log(response)});
//ldjs.publishArtifact(oip041, function(res){ console.log(res); });

//var verify = ldjs.verifyArtifact(artifactEdit);
//console.log(verify);