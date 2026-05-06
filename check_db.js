
const { db: { safeQuery } } = require("./server/global/index");

async function checkBattles() {
    try {
        const battles = await safeQuery("SELECT * FROM battles ORDER BY created_at DESC LIMIT 5", []);
        console.log(JSON.stringify(battles, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkBattles();
