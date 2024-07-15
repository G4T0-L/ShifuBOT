const { SlashCommandBuilder } = require('discord.js');
const { Shift } = require('../../models/Shift');
const ExcelJS = require('exceljs');
const { Op } = require('sequelize');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shifts')
        .setDescription('Genera un reporte de turnos en un rango de fechas')
        .addStringOption(option => 
            option.setName('desde')
                .setDescription('Fecha de inicio (DD/MM/YYYY)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('hasta')
                .setDescription('Fecha de fin (DD/MM/YYYY)')
                .setRequired(true)),
    async execute(interaction) {
        const member = interaction.member;
        const guildId = interaction.guild.id;

        if (!member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply('No tienes permisos para usar este comando.');
        }

        const desde = interaction.options.getString('desde');
        const hasta = interaction.options.getString('hasta');

        try {
            const desdeDate = moment(desde, 'DD/MM/YYYY').startOf('day').toDate();
            const hastaDate = moment(hasta, 'DD/MM/YYYY').endOf('day').toDate();

            const shifts = await Shift.findAll({
                where: {
                    guildId: guildId,
                    fechaInicio: {
                        [Op.between]: [desdeDate, hastaDate]
                    }
                }
            });

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Shifts');

            worksheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'AGENTE', key: 'agent', width: 30 },
                { header: 'FECHA INICIO', key: 'fechaInicio', width: 20 },
                { header: 'HORA INICIO', key: 'horaInicio', width: 20 },
                { header: 'FECHA FIN', key: 'fechaFin', width: 20 },
                { header: 'HORA FIN', key: 'horaFin', width: 20 },
                { header: 'FECHA INICIO BREAK', key: 'fechaInicioBreak', width: 20 },
                { header: 'HORA INICIO BREAK', key: 'horaInicioBreak', width: 20 },
                { header: 'FECHA FIN BREAK', key: 'fechaFinBreak', width: 20 },
                { header: 'HORA FIN BREAK', key: 'horaFinBreak', width: 20 },
                { header: 'RAZÓN BREAK', key: 'razonBreak', width: 30 },
                { header: 'TOTAL BREAK (horas)', key: 'totalBreak', width: 20 },
                { header: 'TOTAL BREAK (HH:MM:SS)', key: 'totalBreakFormatted', width: 20 },
                { header: 'TOTAL TRABAJADO (HH:MM:SS)', key: 'totalWorked', width: 20 }
            ];

            shifts.forEach(shift => {
                worksheet.addRow({
                    id: shift.id,
                    agent: shift.agent,
                    fechaInicio: shift.fechaInicio ? moment(shift.fechaInicio).format('D/MM/YYYY') : '',
                    horaInicio: shift.horaInicio ? moment(shift.horaInicio).format('h:mm:ss a') : '',
                    fechaFin: shift.fechaFin ? moment(shift.fechaFin).format('D/MM/YYYY') : '',
                    horaFin: shift.horaFin ? moment(shift.horaFin).format('h:mm:ss a') : '',
                    fechaInicioBreak: shift.fechaInicioBreak ? moment(shift.fechaInicioBreak).format('D/MM/YYYY') : '',
                    horaInicioBreak: shift.horaInicioBreak ? moment(shift.horaInicioBreak).format('h:mm:ss a') : '',
                    fechaFinBreak: shift.fechaFinBreak ? moment(shift.fechaFinBreak).format('D/MM/YYYY') : '',
                    horaFinBreak: shift.horaFinBreak ? moment(shift.horaFinBreak).format('h:mm:ss a') : '',
                    razonBreak: shift.razonBreak || '',
                    totalBreak: shift.totalBreak.toFixed(2),
                    totalBreakFormatted: shift.totalBreakFormatted || '',
                    totalWorked: shift.totalWorked || ''
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();

            await interaction.reply({
                content: 'Aquí está tu reporte de turnos:',
                files: [{
                    attachment: buffer,
                    name: `Shifts_${desde}_to_${hasta}.xlsx`
                }]
            });
        } catch (error) {
            console.error('Error generating report:', error);
            await interaction.reply('Hubo un error generando el reporte.');
        }
    }
};
