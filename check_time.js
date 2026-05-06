
const { db: { safeQuery } } = require("./server/global/index");

async function checkTime() {
    try {
        const time = await safeQuery("SELECT NOW() as now, @@system_time_zone, @@time_zone", []);
        console.log(JSON.stringify(time, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkTime();
