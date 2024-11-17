import moment from "moment-timezone";

const timeZone = "Europe/Zurich";

const timestampISO = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");

const timestampFormatted = moment()
    .tz(timeZone)
    .format("DD.MM.YYYY HH:mm:ss (Z)");

export { timestampISO, timestampFormatted };
