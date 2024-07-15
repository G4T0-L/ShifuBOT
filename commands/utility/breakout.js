const { SlashCommandBuilder } = require('discord.js');
const { Shift } = require('../../models/Shift');
const { Sequelize } = require('sequelize');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('breakout')
        .setDescription('Finalizar descanso'),
    async execute(interaction) {
        const agent = interaction.member.nickname || interaction.user.username;
        const guildId = interaction.guild.id;
        
        const shift = await Shift.findOne({ 
            where: { 
                agent, 
                guildId,
                fechaInicioBreak: { [Sequelize.Op.ne]: null }, 
                fechaFinBreak: null 
            } 
        });

        if (!shift) {
            await interaction.reply(`No tienes un descanso activo para cerrar, ${agent}.`);
            return;
        }

        const now = new Date();
        const breakDuration = (now - shift.fechaInicioBreak) / (1000 * 60 * 60); // Duración en horas

        shift.fechaFinBreak = now;
        shift.horaFinBreak = now;
        shift.totalBreak += breakDuration;
        await shift.save();

        await interaction.reply(`Fin de descanso registrado para ${agent}. Duración: ${breakDuration.toFixed(2)} horas.`);
    },
};
