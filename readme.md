# thebutton Hue visualizer

nodejs application that reads the current seconds remaining on r/thebutton, maps it to the appropriate subreddit flair colour, and sets all Philips Hue lights on your network to that colour in realtime.

### Demo

[![Demonstration video](http://img.youtube.com/vi/IJ2USEcRBKc/0.jpg)](https://www.youtube.com/watch?v=IJ2USEcRBKc)

### Installation

  - npm install nattress/thebutton-hue
  - cd node_modules/thebutton-hue
  - node server.js
  - It will fail the first time because Node.JS doesn't have a valid username on your Hue Bridge.  The app will create a username for you.  Paste it into the Username variable and re-run.
  - If you have multiple Hue Bridges, select the one you want by putting its ID (displayed in the bridge enumeration on startup) into the BridgeIdToUse variable

