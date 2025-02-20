const AppError = require("../utils/appError");
const { sequelize } = require("../config/postgresConnection");

exports.getPatientAppointmentsService = async (userId, page, search = '') => {
    try {
        const limit = 10;
        const result = await sequelize.query(
            `SELECT get_patient_appointments(:userId, :page, :limit, :search) AS appointments`,
            {
                replacements: { userId, page, limit, search },
                type: sequelize.QueryTypes.SELECT,
            }
        );
        const appointments = result.length > 0 ? result[0].appointments : [];
        return appointments;
    } catch (error) {
        throw new AppError(error.message || "Failed to fetch patient appointments", 500);
    }
};

