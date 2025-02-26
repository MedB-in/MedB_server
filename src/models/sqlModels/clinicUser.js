const { DataTypes } = require("sequelize");
const { sequelize } = require("../../config/postgresConnection");
const Users = require("../sqlModels/userModel");
const Clinics = require("../sqlModels/clinicsModel");

const ClinicUser = sequelize.define("ClinicUser", {
    clinicUserId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Users,
            key: "userId",
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
}, {
    timestamps: false,
    tableName: "ClinicUsers",
});

ClinicUser.belongsTo(Users, { foreignKey: "userId", as: "user" });
ClinicUser.belongsTo(Clinics, { foreignKey: "clinicId", as: "clinic" });
ClinicUser.belongsTo(Users, { foreignKey: "createdBy", as: "createdByUser" });
ClinicUser.belongsTo(Users, { foreignKey: "modifiedBy", as: "modifiedByUser" });

module.exports = ClinicUser;
