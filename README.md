# dc_tribe_manager
simple discord role manager for ark survival evolved

## Requirements
You need NodeJS and NPM installed.

This bot is meant for usage with CrossArkChat (https://github.com/spikeydragoon/Cross-Ark-Chat.git) by allowing the tribe leaders to assign the access role for a discord text channel with the tribe logs to any user without requirering to ask an administrator. Altough it can be used otherwise, as this bots only purpose is to give a user with a leader role the ability to assign a specific role to any member with out the need of any server side permissions!

# Installation
1 Start by cloning the repository and installing the packages
```
git clone https://github.com/King007t/dc_tribe_manager.git
cd dc_tribe_manager
npm install
```
2 to be able to connect to a Discord server you will need a bot token.
[Here's a guide](#0) on how to get a token. Store your token as a string called `token` inside `config.json`. Fill out the rest of your config file too. 

Your config file (config.json) will look something like this:
```
{
	"prefix": "!",				//prefix for recognition of bot commands
	"token": "random_characters",		//discord bot token to connect to
	"globalsec": "5"			//seconds a message from the bot will be displayed
}
```

3 Start the bot by running the following command within the dc_tribe_manager directory
```
node main.js
```
**OR** Make the bot run in the background and on system startup by creating a systemd service

Step 1: Create a new systemd service for dc_tribe_manager
```
sudo nano /lib/systemd/system/dc_tribe_manager.service 
```

Step 2: Paste the following content and replace User and Group with your own username
```
[Unit]
Description=dc_tribe_manager
[Service]
Type=simple
Restart=on-failure
RestartSec=5
StartLimitInterval=60s
StartLimitBurst=3
User=[username]
Group=[username]
ExecStart=node /home/[username]/dc_tribe_manager/
ExecReload=/bin/kill -s HUP $MAINPID
ExecStop=/bin/kill -s TERM $MAINPID
[Install]
WantedBy=multi-user.target
```

Step 3: Press Ctrl + x,y (to save), Enter (to save with the same name)

Step 4: Enable the new dc_tribe_manager service (optional but will make the bot start on boot)
```
sudo systemctl enable dc_tribe_manager.service
```

Step 5: Reload the Systemd Daemon (Do this every time you modify a server file)
```
sudo systemctl daemon-reload
```

Step 6: start the dc_tribe_manager service. You can use start, stop, restart or status. You don't have to run it manually again if it's enabled to start on boot (Step 4).
```
sudo systemctl start dc_tribe_manager.service
```

## Available commands
_NOTE! The default prefix is !. The prefix must be used before the command for it to work._

COMMANDS FOR TRIBELEADER
* **addmember @user** - adds the memberrole to a user
* **kickmember @user** - removes the member role of a user

COMMANDS FOR ADMINISTRATOR
* **addtribe [tribename] @leaderRole @memberRole** - register a new tribe in the bot
* **rmtribe [tribename]** - remove a registered tribe from the bot
* **listalltribes** - outputs a list of all currently registered tribes
* **reload** - reload all external configuration files
