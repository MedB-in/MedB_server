const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/postgresConnection");
const Users = require("./userModel");
const Doctors = require("./doctorsModel");
const Clinics = require("./clinicsModel");

const DoctorSlot = sequelize.define("DoctorSlot", {
    doctorSlotId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Doctors,
            key: "doctorId",
        },
    },
    clinicId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Clinics,
            key: "clinicId",
        },
    },
    day: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    timingFrom: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    timingTo: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    slotGap: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
        tableName: "DoctorSlots",
    });

// Relationships
DoctorSlot.belongsTo(Doctors, { foreignKey: "doctorId", as: "doctor" });
DoctorSlot.belongsTo(Clinics, { foreignKey: "clinicId", as: "clinic" });
DoctorSlot.belongsTo(Users, { foreignKey: "createdBy", as: "createdByUser" });
DoctorSlot.belongsTo(Users, { foreignKey: "modifiedBy", as: "modifiedByUser" });

module.exports = DoctorSlot;
