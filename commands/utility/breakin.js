const { SlashCommandBuilder } = require('discord.js');
const { Shift } = require('../../models/Shift');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('breakin')
        .setDescription('Iniciar descanso')
        .addStringOption(option => 
            option.setName('razon')
                .setDescription('Razón del descanso')
                .setRequired(true)),
    async execute(interaction) {
        const agent = interaction.member.nickname || interaction.user.username;
        const guildId = interaction.guild.id;
        const razon = interaction.options.getString('razon');
        
        const shift = await Shift.findOne({ 
            where: { 
                agent, 
                guildId,
                fechaFin: null 
            } 
        });

        if (!shift) {
            await interaction.reply(`No tienes un turno activo para iniciar un descanso, ${agent}.`);
            return;
        }

        if (shift.fechaInicioBreak && !shift.fechaFinBreak) {
            await interaction.reply(`Ya tienes un descanso activo, ${agent}. Primero debes cerrar el descanso actual.`);
            return;
        }

        shift.fechaInicioBreak = new Date();
        shift.horaInicioBreak = new Date();
        
        if (shift.razonBreak) {
            shift.razonBreak += `\n- ${razon}`;
        } else {
            shift.razonBreak = `- ${razon}`;
        }

        await shift.save();
        await interaction.reply(`Inicio de descanso registrado para ${agent}. Razón: ${razon}`);
    },
};
