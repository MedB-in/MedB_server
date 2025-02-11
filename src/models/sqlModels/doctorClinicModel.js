const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/postgresConnection");
const Users = require("./userModel");
const Doctors = require("./doctorsModel");
const Clinics = require("./clinicsModel");

const DoctorClinic = sequelize.define("DoctorClinic", {
    doctorClinicId: {
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
    joinedDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
        tableName: "DoctorClinic",
    }
);

// Relationships
DoctorClinic.belongsTo(Doctors, { foreignKey: "doctorId", as: "doctor" });
DoctorClinic.belongsTo(Clinics, { foreignKey: "clinicId", as: "clinic" });
DoctorClinic.belongsTo(Users, { foreignKey: "createdBy", as: "createdByUser" });
DoctorClinic.belongsTo(Users, { foreignKey: "modifiedBy", as: "modifiedByUser" });

module.exports = DoctorClinic;
