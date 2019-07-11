const wait = pTime => new Promise(pResolve => setTimeout(pResolve, pTime));

export {wait};
