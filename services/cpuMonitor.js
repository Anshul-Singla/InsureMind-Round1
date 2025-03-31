const os = require("os");
const { exec } = require("child_process");

function checkCPUUsage() {
    setInterval(() => {
        const load = os.loadavg()[0] * 100 / os.cpus().length;
        console.log(`CPU Usage: ${load.toFixed(2)}%`);
        if (load > 70) {
            console.log("High CPU usage detected! Restarting...");
            exec("npx pm2 restart all", (err, stdout, stderr) => {
                if (err) console.error(`Error restarting: ${stderr}`);
                else console.log(`Restarted: ${stdout}`);
            });
        }
    }, 5000);
}
// CPU Usage: 22.43%
// High CPU usage detected! Restarting...
// Error restarting: /bin/sh: pm2: command not found
module.exports = checkCPUUsage;
