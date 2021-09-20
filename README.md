# Ghosts

Multiplayer game using Socket IO

## Setup

Install the dependencies in `package.json` using `npm install` and start the server with `node server.js`. This application is listening on port 8000. In order to play multiplayer, find out your private iPv4 address and connect a second player from another computer using `192.168.X.X:8000`.

The game requires two clients to be connected for the game to start. To just try it out you could connect both clients from the same computer using multiple tabs in the same browser.

## Screenshot

![](https://user-images.githubusercontent.com/72305598/134011885-8398250d-1100-42bf-bc3c-f8a2c35e0450.png)

## How to play

Move around with the arrow keys and hit space to attack. Ghosts will spawn frequently and follow one of the players at random. If an enemy is next to the player when attacking it will take damage. Ghost will also attack the player when close and their attacks are represented by a grey/orange circle which indicates if it was a missed hit or a successful hit.

## Game over

The game is lost when both players' health reaches 0. To regenerate health, medicine packs spawn randomly across the map which can be picked up simply by stepping over them.
