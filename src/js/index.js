'use strict';

import '@/css/style.css';

/*
* Attention follow these rules:
* 1. Use strict mode: "use strict"
* 2. Use single quotes -> eslint set
* 3. Use function expression -> eslint set
* 4. Name variables in camelCase -> eslint set
* 5. Clean commenting ->
* 6. Clear structure (new lines / group code) -> eslint set
* 7. Cleanup before production
*/

const init = function (){

  console.log('Hello from Paintify');

};

window.addEventListener('load', init);
