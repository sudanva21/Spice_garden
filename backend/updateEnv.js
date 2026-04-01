const fs = require('fs');
const envPath = '.env';
let envParams = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

const serviceAccountStr = fs.readFileSync('c:/Users/sudanva/Downloads/spicegardengkk-firebase-adminsdk-fbsvc-0c807cce01.json', 'utf8');

const updateEnv = (key, val) => {
    const regex = new RegExp('^' + key + '=.*$', 'm');
    const safeVal = `'${val.replace(/\n/g, '\\n')}'`;
    if (regex.test(envParams)) {
        envParams = envParams.replace(regex, key + '=' + safeVal);
    } else {
        envParams += '\n' + key + '=' + safeVal;
    }
};

updateEnv('FIREBASE_SERVICE_ACCOUNT_JSON', JSON.stringify(JSON.parse(serviceAccountStr)));

fs.writeFileSync(envPath, envParams);
console.log('Firebase env vars updated successfully.');
