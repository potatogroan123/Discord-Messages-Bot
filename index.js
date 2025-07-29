const axios = require("axios");
const fs = require("fs");

// Load data from files
const tokens = JSON.parse(fs.readFileSync("tokens.json", "utf-8"));
const userIds = JSON.parse(fs.readFileSync("Userids.json", "utf-8"));
const messages = JSON.parse(fs.readFileSync("messages.json", "utf-8"));
const channelId = "1235509540821139506" // Put the channel id you want the discord bots to be messaging in
//  Set Interval Range (Adjust as Needed)
const MIN_INTERVAL = 1300* 1000; 
const MAX_INTERVAL = 4500 * 1000; 

let availableBots = [...tokens]; // Copy of token list for shuffling

// Function to shuffle array randomly
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Function to get a random time interval within the defined range
function getRandomInterval() {
  return Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL) + MIN_INTERVAL);
}

// Function to send a message
async function sendMessage(token, userId, message) {
  try {
    // Validate token by getting bot's user info
    const botInfo = await axios.get("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: token },
    });

    console.log(` Bot authenticated: ${botInfo.data.username} (${botInfo.data.id})`);

    // Send the message
    const response = await axios.post(
      `https://discord.com/api/v10/channels/${channelId}/messages`, // Replace with a valid channel ID if needed
      { content: ` <@${userId}> ${message}` },
      { headers: { Authorization: token, "Content-Type": "application/json" } }
    );

    console.log(`Sent message from : ${response.status}`);
  } catch (err) {
    console.error(`❌ Error sending message with token : ${err.response?.data?.message || err.message}`);
  }
}

// Main function to manage bots and random intervals
async function startMessageProcess() {
  while (true) {
    // If all bots have been used, shuffle and reset
    if (availableBots.length === 0) {
      console.log("All bots used. Shuffling and resetting...");
      availableBots = shuffleArray([...tokens]);
    }

    // Select the next random bot (without repeating until all are used)
    const botToken = availableBots.pop();
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];

    // Send the message
    await sendMessage(botToken, userId, message);

    // Wait for a random interval before sending the next message
    const interval = getRandomInterval();
    console.log(` Waiting for ${interval / 1000} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

// Start the process
startMessageProcess();
