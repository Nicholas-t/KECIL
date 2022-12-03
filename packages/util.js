/**
 * https://stackoverflow.com/a/1349426
 * @param {number} length of unique id
 * @returns 
 */
function makeId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
/**
 * convertDate - converting timestamp to string format
 * @param {number} timestamp 
 * @returns time in string
 */
function convertDate(timestamp) {
    let k = new Date(timestamp * 1000);
    return `${k.getDate()} ${Month[k.getMonth()]} ${k.getFullYear()}`;
}

/**
 * getCurrentTime - get current time number
 * @returns time in number (seconds)
 */
function getCurrentTime() {
    return Math.round((new Date()) / 1000);
}

module.exports = {
    makeId,
    convertDate,
    getCurrentTime
}