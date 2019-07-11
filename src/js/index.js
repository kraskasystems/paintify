import '../css/style.css';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faPaintBrush, faEraser, faUndo, faLayerGroup, faEye, faTrash, faTint, faBomb, faPlusCircle, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { faCircle, faSquare } from '@fortawesome/free-regular-svg-icons';
import { Paintify } from '../js/classes/Paintify';

import appConfig from '../config/paintify.config';

library.add( faPaintBrush, faEraser, faCircle, faUndo, faLayerGroup, faEye, faTrash, faTint, faBomb, faPlusCircle, faSquare, faCircle, faPencilAlt);

dom.i2svg();
dom.watch();

// Brush
const brushBtn = document.getElementById('toolBrush');
// Eraser
const eraserBtn = document.getElementById('toolEraser');
// color palette
const paletteContainer = document.getElementById('colorPalette');
// layer stack
const stage = document.getElementById('stage');
// clear button
const resetBtn = document.getElementById('toolReset');
// add layer btn
const addLayerBtn = document.getElementById('addLayerBtn');
// layer wrapper
const layerSystemWrapper = document.getElementById('layers');

// Paintify instance
const paintify = new Paintify({config: appConfig, domElements: {brush: brushBtn, eraser: eraserBtn, colorPalette: paletteContainer, stage: stage, layerSystemWrapper: layerSystemWrapper}});

const init = function () {
  resetBtn.addEventListener('click', () => { paintify.clearLayer(); } );
  addLayerBtn.addEventListener('click', () => { paintify.addLayer(); } );
  window.addEventListener('mousemove', (e) => { paintify.draw(e); paintify.drawStrokeThickness(e); });
  window.addEventListener('mousedown', (e) => { paintify.setDrawPosition(e); });
  window.addEventListener('mouseenter', (e) => { paintify.setDrawPosition(e);});
  window.addEventListener('wheel', (e) => { paintify.setBrushSize(e); paintify.drawStrokeThickness(e);});
  console.log(paintify);
};

window.addEventListener('load', init);
