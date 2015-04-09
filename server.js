var HueApi = require("node-hue-api");
var app = require('http').createServer()
var WebSocketClient = require('websocket').client;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//
// Config
//

// After first run, enter the username created by your bridge here and run the script again
var Username = "11bff2b339a62e0f3267ddab394a1d87";

// If you have multiple bridges on your network, enter the ID of the bridge you 
// want to use here.
var BridgeIdToUse = "";


var api;
var state = HueApi.lightState.create();
var HueInitialized = false;

var displayBridges = function(bridge) {
    console.log("Hue Bridges Found: " + JSON.stringify(bridge));
};

var displayResult = function(result) {
    console.log(JSON.stringify(result, null, 2));
};

var displayUserResult = function(result) {
    console.log("Created user: " + JSON.stringify(result));
};

function registerUser(hostname)
{
    api.createUser(hostname, null, null, function(err, user) {
        if (err) throw err;
        displayUserResult(user);
    });
}

function turnOnLights()
{
    api.lights(function(err, lights) {
        if (err) throw err;
        console.log("Turning on lights");
        console.log(lights.lights);
        for (var i = 0; i < lights.lights.length; i++)
        {
            console.log("Enabling light " + lights.lights[i].id);
            api.setLightState(lights.lights[i].id, state.on()).done();
        }
    });
}

// RGB values taken from the flair CSS settings.  I had to tweak blue since the Hue does a bad
// job with light blue colours.
function rgbFromSecondsRemaining(seconds)
{
    var i = parseInt(seconds);

    if (i > 51)
        return [130, 0, 128];
    else if (i > 41)
        return [0, 50, 199];
    else if (i > 31)
        return [2, 190, 1];
    else if (i > 21)
        return [229, 217, 0];
    else if (i > 11)
        return [229, 149, 0];
    else
        return [229, 0, 0];
}

function setLights(timeRemaining)
{
    var rgb = rgbFromSecondsRemaining(timeRemaining);
    console.log("Setting lights to " + rgb);
    api.lights(function(err, lights) {
        if (err) throw err;
        
        for (var i = 0; i < lights.lights.length; i++)
        {
            api.setLightState(lights.lights[i].id, state.on().rgb(rgb)).done();
        }
    });
}

// Search for Hue bridges on the local network
HueApi.nupnpSearch(function(err, result) {
    if (err) throw err;

    if (result.length == 0)
    {
        console.log("No Hue bridges found");
        return;
    }

    if (result.length > 1)
    {
        console.log("Multiple bridges found. Select the bridge id that you want to use and enter it in the BridgeIdToUse configuration variable.");
        displayBridges(result);
        return;
    }

    var hostIp = result[0].ipaddress;
    
    api = new HueApi.HueApi(hostIp, Username);
    
    api.config(function(err, config) {
        if (err) throw err;

        if (config.ipaddress === undefined)
        {
            // User not registered
            registerUser(hostIp);
        }
        turnOnLights();
        HueInitialized = true;
    });

    
});

// Shamelessly stolen from Jamesrom's cool button visualizer:
// https://github.com/jamesrom/jamesrom.github.io/blob/master/comms.js
var Comms = (function() {
    var self = {};
    var sock;

    var redditRequester = new XMLHttpRequest();

    redditRequester.onreadystatechange = function () {
        if (redditRequester.readyState !== 4) {
            return;
        }
        var websocketURL;
        if (redditRequester.status === 200) {
            var regex = /"(wss:\/\/wss\.redditmedia\.com\/thebutton\?h=[^"]*)"/g;
            websocketURL = regex.exec(redditRequester.responseText)[1];
        }

        websocketURL = websocketURL || "wss://wss.redditmedia.com/thebutton?h=7f66bf82878e6151f7688ead7085eb63a0baff0b&e=1428621271";
        
        console.log("Connecting to: " + websocketURL);
        var client = new WebSocketClient();

        client.on('connect', function(connection) {
            connection.on('message', tick);
        });

        client.connect(websocketURL);
    };
    // Use CORS proxy by lezed1 to get the Reddit homepage!
    redditRequester.open("get", "http://cors-unblocker.herokuapp.com/get?url=https%3A%2F%2Fwww.reddit.com%2Fr%2Fthebutton", true);
    redditRequester.send();

    function tick(evt) {
        var packet = JSON.parse(evt.utf8Data);
        
        if (HueInitialized)
        {
            console.log(packet.payload.seconds_left + "s");
            setLights(packet.payload.seconds_left);
        }
    }

    return self;
}())