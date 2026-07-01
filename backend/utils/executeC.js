const { exec } = require("child_process");
const path = require("path");

const executeC = (filePath, inputPath) => {
    return new Promise((resolve, reject) => {
        const codeDir = path.dirname(filePath);
        const inputDir = path.dirname(inputPath);
        const codeFile = path.basename(filePath);
        const inputFile = path.basename(inputPath);

        const command = `docker run --rm --memory="512m" --network none -v "${codeDir}":/app/codes -v "${inputDir}":/app/inputs -w /app gcc:latest sh -c "gcc codes/${codeFile} -o /app/a.out && /app/a.out < inputs/${inputFile}"`;

        exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
            if (error) {
                if (error.killed) {
                    return reject("Time Limit Exceeded");
                }
                return reject(error.message || stderr);
            }
            if (stderr) return reject(stderr);
            resolve(stdout);
        });
    });
};
module.exports = { executeC };