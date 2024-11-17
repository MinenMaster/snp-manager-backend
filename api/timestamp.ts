import moment from "moment-timezone";

const timeZone = "Europe/Zurich";

const getCurrentTimestampISO = () =>
    moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
const getCurrentTimestampFormatted = () =>
    moment().tz(timeZone).format("DD.MM.YYYY HH:mm:ss (Z)");

export { getCurrentTimestampISO, getCurrentTimestampFormatted };
