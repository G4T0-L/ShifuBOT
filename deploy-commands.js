const { REST, Routes } = require('discord.js');
const { token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits } = require('discord.js');

// Initialize Discord Client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const commands = [];
    const foldersPath = path.join(__dirname, 'commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }

    const rest = new REST().setToken(token);

    try {
        const guilds = client.guilds.cache.map(guild => guild.id);
        
        for (const guildId of guilds) {
            console.log(`Started refreshing ${commands.length} application (/) commands for guild ${guildId}.`);

            const data = await rest.put(
                Routes.applicationGuildCommands(client.user.id, guildId),
                { body: commands },
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands for guild ${guildId}.`);
        }
    } catch (error) {
        console.error(error);
    }

    client.destroy();
});

client.login(token);
