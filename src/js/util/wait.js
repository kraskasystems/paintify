/**
 * function to be able to simply wait for some time
 * @param pTime {number} - time in ms
 * @returns {Promise<any>}
 */

const wait = pTime => new Promise(pResolve => setTimeout(pResolve, pTime));

export {wait};
