const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '../outputs');
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filepath, inputPath) => {
    const jobId = path.basename(filepath).split('.')[0];
    
    const backendDir = path.join(__dirname, '..'); 
    
    const containerCodePath = `/app/codes/${jobId}.cpp`;
    const containerOutPath = `/app/outputs/${jobId}.out`;
    const containerInputPath = inputPath ? `/app/inputs/${path.basename(inputPath)}` : null;

    return new Promise((resolve, reject) => {
        
        const command = containerInputPath 
            ? `docker run --rm --memory="256m" --network none -v "${backendDir}":/app gcc:latest bash -c "g++ ${containerCodePath} -o ${containerOutPath} && ${containerOutPath} < ${containerInputPath}"`
            : `docker run --rm --memory="256m" --network none -v "${backendDir}":/app gcc:latest bash -c "g++ ${containerCodePath} -o ${containerOutPath} && ${containerOutPath}"`;

        exec(command, { timeout: 20000 }, (error, stdout, stderr) => {
            if (error) {
                if (error.killed) {
                    return reject("Time Limit Exceeded");
                }
                reject({ error, stderr });
            }
            if (stderr) {
                reject(stderr);
            }
            resolve(stdout);
        });
    });
};

module.exports = {
    executeCpp
};