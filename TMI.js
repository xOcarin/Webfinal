const express = require('express');
const app = express();
const tmi = require('tmi.js');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

let client = null;
let viewers = [];
let displayNames = [];

const lastActive = {};

function handleMessage(channel, tags, message, self) {
  const displayName = tags['display-name'];
  console.log("dispalynames:" +displayNames);
  console.log("viewers:" +viewers);
  if (!displayNames.includes(displayName)) {
    displayNames.push(displayName);
  }
  lastActive[displayName] = Date.now();
}

function startTmiClient(channel) {
  // Stop existing client if there is one
  if (client) {
    client.removeListener('message', handleMessage)
    client.disconnect();
    client.ws.close();
  }

  // Initialize the TMI client
  client = new tmi.Client({
    connection: {
      secure: true,
      reconnect: true,
    },
    channels: [channel],
  });
  console.log("sadhjasdhjjashd: " + channel);

  // Connect the client to the Twitch chat
  client.connect();


  // Handle incoming chat messages
  client.on('message', handleMessage);
  client.on('subscription', (channel, username, methods, message, userstate) => {
  console.log("SOMEONE SUBBED!");
  console.log(`${username} just subscribed to ${channel}`);
  });


  // Read the settings from file
  // Read the settings from file
  let settings = require('./settings.json');

  setInterval(() => {
    delete require.cache[require.resolve('./settings.json')];
    settings = require('./settings.json');
    //console.log("del:" + settings.timeout);
  }, 1000);

  // Update the viewer list every `settings.timeout` milliseconds
  setInterval(() => {
    //console.log("in:" + settings.timeout);
    //console.log("v:" + viewers);
    //console.log("d:" + displayNames);
    viewers = displayNames.slice();
    const currentTime = Date.now();
    Object.keys(lastActive).forEach((displayName) => {
      if (currentTime - lastActive[displayName] > (settings.timeout * 60000)) {
        delete lastActive[displayName];
        const index = displayNames.indexOf(displayName);
        if (index !== -1) {
          displayNames.splice(index, 1);
          viewers = displayNames.slice();
          console.log("chesdasd: " + settings.channel);

        }
      }
    });
  }, 100);




  // Serve the viewer list via an HTTP endpoint
  app.get('/viewers', (req, res) => {
    res.json({ viewers: viewers });
  });
}


// Read the initial channel name from file and start the TMI client
readFile('streamername.txt')
  .then(data => {
    const channel = data.toString();
    console.log('Channel:', channel);
    startTmiClient(channel);

    // Watch for changes to the channel name file and restart the TMI client if it changes
    fs.watch('streamername.txt', (eventType, filename) => {
      console.log(`File ${filename} has been changed`);
      readFile('streamername.txt')
        .then(data => {
          const newChannel = data.toString();
          console.log('New channel:', newChannel);
          //client.disconnect();
          viewers = [];
          displayNames = [];
          //displayNames.length = 0;
          startTmiClient(newChannel);
        })
        .catch(err => {
          console.error('Failed to read channel name:', err);
          process.exit(1);
        });
    });
  })
  .catch(err => {
    console.error('Failed to read channel name:', err);
    process.exit(1);
  });

module.exports = app;
