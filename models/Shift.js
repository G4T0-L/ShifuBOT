const { Sequelize, DataTypes } = require('sequelize');

// Configura la base de datos SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite' // Esto creará el archivo en el directorio raíz del proyecto
});

const Shift = sequelize.define('Shift', {
  agent: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fechaInicio: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  horaInicio: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  fechaFin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  horaFin: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  fechaInicioBreak: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  horaInicioBreak: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  fechaFinBreak: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  horaFinBreak: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  razonBreak: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  totalBreak: {
    type: DataTypes.FLOAT, // En horas
    defaultValue: 0,
  },
  totalBreakFormatted: {
    type: DataTypes.STRING, // En formato HH:MM:SS
    allowNull: true,
  },
  totalWorked: {
    type: DataTypes.STRING, // En formato HH:MM:SS
    allowNull: true,
  }
});

module.exports = { Shift, sequelize };
