const { exec } = require("child_process");
const path = require("path");

const executeJava = (filePath, inputPath) => {
    return new Promise((resolve, reject) => {
        const codeDir = path.dirname(filePath);
        const inputDir = path.dirname(inputPath);
        const codeFile = path.basename(filePath);
        const inputFile = path.basename(inputPath);

        const command = `docker run --rm --memory="512m" --network none -v "${codeDir}":/app/codes -v "${inputDir}":/app/inputs -w /app eclipse-temurin:11-jdk sh -c "cp codes/${codeFile} Main.java && javac Main.java && java Main < inputs/${inputFile}"`;

        exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
            if (error) {
                if (error.killed) {
                    return reject("Time Limit Exceeded");
                }
                console.error("\n❌ JAVA COMPILATION ERROR:");
                console.error(stderr || error.message);
                console.error("--------------------------\n");
                return reject(stderr || error.message);
            }
            if (stderr) {
                return reject(stderr);
            }
            resolve(stdout);
        });
    });
};
module.exports = { executeJava };