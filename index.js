require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('GoWatchBot is Online!');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Serveur de garde actif sur le port ${PORT}`);
});

const { 
    REST, 
    Routes, 
    Client, 
    GatewayIntentBits, 
    Partials, 
    Collection, 
    ActivityType, 
    PresenceUpdateStatus, 
    Events 
} = require('discord.js');

const deploycomands = async () => {
    try {
        const commands = [];
        const commandsPath = path.join(__dirname, 'commands');
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            }
        }

        const rest = new REST().setToken(process.env.BOT_TOKEN);
        console.log(`Rafraîchissement des ${commands.length} commandes...`);
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        console.log('✅ Commandes slash rechargées avec succès !');
    } catch (error) {
        console.error('Erreur lors du déploiement :', error);
    }
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

client.once(Events.ClientReady, async () => {
    console.log(`Prêt ! Connecté en tant que ${client.user.tag}`);
    await deploycomands();
    
    client.user.setPresence({
        status: PresenceUpdateStatus.Online,
        activities: [{ name: 'Aider la famille', type: ActivityType.Playing }]
    });
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Une erreur est survenue !', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Une erreur est survenue !', ephemeral: true });
        }
    }
});

client.login(process.env.BOT_TOKEN);