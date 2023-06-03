const discord = require("discord.js");
const fs = require("fs");
var client = new discord.Client({
   intents: ["GUILDS", "GUILD_MESSAGES"]
});
var dict = require("./tribes.json");
var config = require("./config.json");

//variables
var prefix = "";
var token = "";
var globalsec = "";

//Load config
loadconfig();

client.on("ready", () => {

   console.log("Bot ready");
});

client.on("messageCreate", (msg) => {

   if (msg.content.startsWith(prefix)) {

      if (msg.author.bot) {
         return;
      }

      var args = [];
      var command = msg.content.toLowerCase().substring(prefix.length);
      args = command.split(" ");
	
      msg.delete();

      switch (args[0]) {

         case ("help"):
		
		if (args.length != 1) {
               sendMessage(msg.channel, `This command functions without arguments. Please use \`\`${prefix}help\`\``, globalsec);
               return;
            }

            var help = `**__COMMANDS FOR TRIBELEADER__**\n1. \`\`${prefix}addmember @user\`\`\n2. \`\`${prefix}kickmember @user\`\``;

            if (msg.member.permissions.has("ADMINISTRATOR")) {
               help += `\n\n**__COMMANDS FOR ADMINISTRATOR__**\n1. \`\`${prefix}addtribe [tribename] @leaderRole @memberRole\`\`\n2. \`\`${prefix}rmtribe [tribename]\`\`\n3. \`\`${prefix}listalltribes\`\`\n4. \`\`${prefix}reload\`\``;
            }

            sendMessage(msg.channel, help, globalsec);
            break;

         case ("addtribe"):

            if (!msg.member.permissions.has('ADMINISTRATOR')) {
               sendMessage(msg.channel, `You dont have the permission to use this command. Use \`\`${prefix}help\`\` for available commands`, globalsec);
               return;
		}

            if (args.length != 4) {
               sendMessage(msg.channel, `Please use \`\`${prefix}addtribe [tribename] [leaderRole] [memberRole]\`\``, globalsec);
               return;
            }

            if (msg.mentions.roles.size != 2) {
               sendMessage(msg.channel, "Please mention 2 roles", globalsec);
               return;
            }

            var tribename = args[1];
            var leaderRole = getRole(args[2], msg);
            var memberRole = getRole(args[3], msg);
				
		if (leaderRole == null) {
               sendMessage(msg.channel, `Role **"${args[2]}"** wasn't found`, globalsec);
               return;
            }
		
		if (memberRole == null) {
               sendMessage(msg.channel, `Role **"${args[3]}"** wasn't found`, globalsec);
               return;
            }

		var foundleader = false;
		var foundmember = false;
		var foundname = false;

		Object.keys(dict).forEach(key => {
  			if (key == leaderRole.id || dict[key]["memberRole"] == leaderRole.id) 
				foundleader = true;
			if (key == memberRole.id || dict[key]["memberRole"] == memberRole.id)
				foundmember = true;
			if (dict[key]["name"] == tribename) 
				foundname = true;
		});
		
            if (foundname == true) {
               sendMessage(msg.channel, `Tribe with the name **"${tribename}"** already exists`, globalsec);
               return;
            }
		
            if (foundleader == true) {
               sendMessage(msg.channel, `The leader role **"${args[2]}"** is already used within another tribe`, globalsec);
               return;
            }

		if (foundmember == true) {
               sendMessage(msg.channel, `The member role **"${args[3]}"** is already used within another tribe`, globalsec);
               return;
            }

            if (dict[leaderRole.id] == null) {
               dict[leaderRole.id] = {
                  "name": "",
                  "memberRole": "",
                  "leaderRole": ""
               };
            }

            dict[leaderRole.id]["name"] = tribename;
            dict[leaderRole.id]["memberRole"] = memberRole.id;
            dict[leaderRole.id]["leaderRole"] = leaderRole.id;

            sendMessage(msg.channel, `Tribe **"${tribename}"** was created with **"${leaderRole.name}"** as the leader's role and **"${memberRole.name}"** as the member's role.`, globalsec);
            save(__dirname + "/tribes.json", dict);
            break;

         case ("rmtribe"):

            if (!msg.member.permissions.has('ADMINISTRATOR')) {
               sendMessage(msg.channel, `You dont have the permission to use this command. Use \`\`${prefix}help\`\` for available commands`, globalsec);
               return;
		}
		
            if (args.length != 2 ) {
               sendMessage(msg.channel, `Please use \`\`${prefix}rmtribe [tribename]\`\``, globalsec);
               return;
            }

            var tribename = args[1];
		var found = false;
		
		Object.keys(dict).forEach(key => {
  			if (dict[key]["name"] == tribename) {
				found = true;
				delete dict[key];
			}
		});
		
            if (found == false) {
               sendMessage(msg.channel, `Tribe with name **"${tribename}"** wasn't found`, globalsec);
               return;
            }

            sendMessage(msg.channel, `Tribe **"${tribename}"** has been removed`, globalsec);
            save(__dirname + "/tribes.json", dict);
            break;

         case ("addmember"):

            if (args.length != 2) {
               sendMessage(msg.channel, `Please use \`\`${prefix}addmember [user]\`\``, globalsec);
               return;
            }

            if (!msg.mentions.users.first()) {
               sendMessage(msg.channel, "Please mention a user", globalsec);
               return;
            }

            if (!isLeader(msg.member)) {
               sendMessage(msg.channel, "You have to be a tribe leader to use this command", globalsec);
               return;
            }
		
            var roleID = getMemberRole(msg.member);
            if (roleID == null) {
               return;
            }
		
            var user = getUser(args[1], msg);
            if (user == null) {
               sendMessage(msg.channel, `Member **"${args[1]}"** wasn't found`, globalsec);
               return;
            }

            user.roles.add(msg.guild.roles.cache.get(roleID));

            sendMessage(msg.channel, `**"${user.user.username}"** was added to your tribe`, globalsec);
            break;

         case ("kickmember"):

            if (args.length != 2) {
               sendMessage(msg.channel, `Please use \`\`${prefix}kickmember [user]\`\``, globalsec);
               return;
            }

            if (!msg.mentions.users.first()) {
               sendMessage(msg.channel, "Please mention a user", globalsec);
               return;
            }

            if (!isLeader(msg.member)) {
               sendMessage(msg.channel, "You have to be a tribe leader to use this command", globalsec);
               return;
            }

            var roleID = getMemberRole(msg.member);
            if (roleID == null) {
               return;
            }

            var user = getUser(args[1], msg);
            if (user == null) {
               sendMessage(msg.channel, `Member **"${args[1]}"** wasn't found`, globalsec);
               return;
            }

            user.roles.remove(msg.guild.roles.cache.get(roleID));

            sendMessage(msg.channel, `**"${user.user.username}"** was removed from your tribe`, globalsec);
            break;

         case ("listalltribes"):

            if (!msg.member.permissions.has('ADMINISTRATOR')) {
               sendMessage(msg.channel, `You dont have the permission to use this command. Use \`\`${prefix}help\`\` for available commands`, globalsec);
               return;
		}

		if (args.length != 1) {
               sendMessage(msg.channel, `This command functions without arguments. Please use \`\`${prefix}listalltribes\`\``, globalsec);
               return;
            }
		
		var text = `**__LIST OF ALL REGISTERED TRIBES__**`;
		var counter = 0;
		
		Object.keys(dict).forEach(key => {
  			text += (`\n` + (counter++) + `. ` + dict[key]["name"]);
		});
            
		if (counter == 0)
			text += `\n-- none --`;
			
            sendMessage(msg.channel, text, globalsec);
            break;

         case ("reload"):

            if (!msg.member.permissions.has('ADMINISTRATOR')) {
               sendMessage(msg.channel, `You dont have the permission to use this command. Use \`\`${prefix}help\`\` for available commands`, globalsec);
               return;
		}

		if (args.length != 1) {
               sendMessage(msg.channel, `This command functions without arguments. Please use \`\`${prefix}reload\`\``, globalsec);
               return;
            }
		
		delete require.cache[require.resolve("./tribes.json")]
		dict = require("./tribes.json");

		delete require.cache[require.resolve("./config.json")]
		config = require("./config.json");
		loadconfig();
            
            sendMessage(msg.channel, `files have been reloaded`, globalsec);

		client.login(token);
            break;

         default:

		sendMessage(msg.channel, `No command found. Use \`\`${prefix}help\`\` for available commands`, globalsec);
            break;
      }
   }

});

function getUser(userArgument, msg) {

   var user = null;
   if (userArgument.startsWith("<")) {
      var s = userArgument.split('!')[0];
      s = s.substring(2, s.length - 1);
      user = msg.guild.members.cache.get(s);
   }
   return user;
}

function getRole(roleArgument, msg) {

   var role = null;
   if (roleArgument.startsWith("<")) {
      var s = roleArgument.split('&')[1];
      s = s.substring(0, s.length - 1);
      role = msg.guild.roles.cache.get(s);
   }
   return role;
}

function getMemberRole(member) {

   var roleID = null;
   let roles = member.roles.cache.map(role => role);

   roles.forEach((role) => {
      if (dict[role.id] != null) {
         if (dict[role.id]["memberRole"] != null) {
            roleID = dict[role.id]["memberRole"];
         }
      }
   });

   return roleID;
}

function isLeader(member) {

   let roles = member.roles.cache.map(role => role);
   let b = false;

   roles.forEach((role) => {
      if (dict[role.id] != null) {
         b = true;
      }
   });

   return b;
}

function save(fileName, obj) {

   var jsonContent = JSON.stringify(obj);

   fs.writeFile(fileName, jsonContent, 'utf8', function (err) {
      if (err) {
         console.log("An error occured while writing JSON Object to File.");
         return console.log(err);
      }
   });
}

function load(fileName) {

   fs.readFile(fileName, 'utf-8', (err, data) => {
      if (err) {
         throw err;
      }

      // parse JSON object
      const thingy = JSON.parse(data.toString());
      return thingy;
   });
}

function loadconfig() {

   prefix = config.prefix;
   token = config.token;
   globalsec = config.globalsec;
}

async function sendMessage(c, text, sec) {

   let em = new discord.MessageEmbed()
      .setColor("#8a00ff")
      .setDescription(text);

   c.send({
      embeds: [em]
   }).then(msg => {
      setTimeout(() => msg.delete(), sec * 1000)
   });
}

client.login(token);
