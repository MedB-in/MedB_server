const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/postgresConnection");
const Doctor = require("../sqlModels/doctorsModel");
const Users = require("../sqlModels/userModel");
const Clinics = require("../sqlModels/clinicsModel");

const Appointment = sequelize.define('Appointment', {
    appointmentId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Doctor,
            key: "doctorId",
        },
    },
    patientId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: Users,
            key: "userId",
        },
    },
    clinicId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "Clinics",
            key: "clinicId",
        },
    },
    appointmentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    appointmentTime: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    appointmentStatus: {
        type: DataTypes.ENUM("Scheduled", "Completed", "Cancelled"),
        defaultValue: "Scheduled",
    },
    reasonForVisit: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    createdOn: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    modifiedOn: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    createdBy: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Users,
            key: "userId",
        },
    },
    modifiedBy: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
            model: Users,
            key: "userId",
        },
    },
},
    {
        timestamps: false,
        tableName: "Appointments",
    }
);

Appointment.belongsTo(Doctor, { foreignKey: "doctorId", as: "doctor" });
Appointment.belongsTo(Users, { foreignKey: "createdBy", as: "createdByUser" });
Appointment.belongsTo(Users, { foreignKey: "modifiedBy", as: "modifiedByUser" });
Appointment.belongsTo(Clinics, { foreignKey: "clinicId", as: "clinic" });

module.exports = Appointment;