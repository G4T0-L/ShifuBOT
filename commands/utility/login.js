const { SlashCommandBuilder } = require('discord.js');
const { Shift } = require('../../models/Shift');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('login')
        .setDescription('Iniciar turno'),
    async execute(interaction) {
        const agent = interaction.member.nickname || interaction.user.username;
        const guildId = interaction.guild.id;
        
        const existingShift = await Shift.findOne({
            where: {
                agent,
                guildId,
                fechaFin: null
            }
        });

        if (existingShift) {
            await interaction.reply(`Ya tienes un turno abierto, ${agent}. Primero debes cerrar el turno actual.`);
            return;
        }

        await Shift.create({ agent, guildId, fechaInicio: new Date(), horaInicio: new Date() });
        await interaction.reply(`Inicio de turno registrado para ${agent}`);
    },
};
