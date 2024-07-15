const { SlashCommandBuilder } = require('discord.js');
const { Shift } = require('../../models/Shift');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logout')
        .setDescription('Finalizar turno'),
    async execute(interaction) {
        const agent = interaction.member.nickname || interaction.user.username;
        const guildId = interaction.guild.id;
        const shift = await Shift.findOne({ 
            where: { 
                agent, 
                guildId,
                fechaFin: null 
            } 
        });

        if (!shift) {
            await interaction.reply(`No tienes un turno activo para cerrar, ${agent}.`);
            return;
        }

        const now = new Date();
        if (shift.fechaInicioBreak && !shift.fechaFinBreak) {
            const breakDuration = (now - shift.fechaInicioBreak) / (1000 * 60 * 60); // Duración en horas
            shift.fechaFinBreak = now;
            shift.horaFinBreak = now;
            shift.totalBreak += breakDuration;
        }

        shift.fechaFin = now;
        shift.horaFin = now;

        const totalWorkedHours = (now - new Date(shift.fechaInicio)) / (1000 * 60 * 60) - shift.totalBreak;
        const totalWorkedDuration = moment.duration(totalWorkedHours, 'hours');
        const totalWorkedFormatted = `${String(Math.floor(totalWorkedDuration.asHours())).padStart(2, '0')}:${String(totalWorkedDuration.minutes()).padStart(2, '0')}:${String(totalWorkedDuration.seconds()).padStart(2, '0')}`;

        const totalBreakDuration = moment.duration(shift.totalBreak, 'hours');
        const totalBreakFormatted = `${String(Math.floor(totalBreakDuration.asHours())).padStart(2, '0')}:${String(totalBreakDuration.minutes()).padStart(2, '0')}:${String(totalBreakDuration.seconds()).padStart(2, '0')}`;

        shift.totalWorked = totalWorkedFormatted;
        shift.totalBreakFormatted = totalBreakFormatted;
        await shift.save();

        await interaction.reply(`Fin de turno registrado para ${agent}. Duración total de descansos: ${totalBreakFormatted}. Total de horas trabajadas: ${totalWorkedFormatted}.`);
    },
};
