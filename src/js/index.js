'use strict';

import '@/css/style.css';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faPaintBrush } from '@fortawesome/free-solid-svg-icons';
import { faEraser }     from '@fortawesome/free-solid-svg-icons';
import { faCircle }     from '@fortawesome/free-solid-svg-icons';


import { faUndo }       from '@fortawesome/free-solid-svg-icons';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { faEye}        from '@fortawesome/free-solid-svg-icons';


library.add( faPaintBrush, faEraser, faCircle, faUndo, faLayerGroup, faEye);
dom.i2svg();

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

  const canvas = function (){
    let elem = document.createElement('canvas');

    elem.setAttribute('class', 'layer');

    return elem;
  };

  const stage = document.getElementById('stage');

  stage.appendChild(canvas());
};

window.addEventListener('load', init);
