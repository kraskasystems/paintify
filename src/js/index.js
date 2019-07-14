// css
import '../css/style.css';

// font-awesome icon import
import { faPaintBrush, faEraser, faUndo, faLayerGroup, faEye, faTrash, faTint, faBomb, faPlusCircle, faPencilAlt, faFile, faDownload, faUpload, faTimes, faBars } from '@fortawesome/free-solid-svg-icons';
import { faCircle, faSquare, faSave} from '@fortawesome/free-regular-svg-icons';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { wait } from './util/wait';

// Paintify resources
import { Paintify } from '../js/classes/Paintify';
import appConfig from '../config/paintify.config';

// font-awesome icon library
library.add(
  faPaintBrush, faEraser, faCircle, faUndo, faLayerGroup, faEye, faTrash, faTint,
  faBomb, faPlusCircle, faSquare, faCircle, faPencilAlt, faFile, faDownload, faUpload,
  faSave, faTimes, faBars);

// font-awesome tools
dom.i2svg();
dom.watch();

// init function
const init = async function(){
  // get spashscreen dom element
  const splashScreen = document.getElementById('splashScreen');

  // initialize paintify - hidden behind splash screen
  new Paintify({config: appConfig});

  // wait for promise resolve from wait
  // fade out splash screen after 2 s
  await wait(2000);
  splashScreen.classList.remove('visible');
  splashScreen.classList.add('invisible');

  // remove splash screen after transition
  await wait(1000);
  splashScreen.remove();

};

window.addEventListener('load', init);
