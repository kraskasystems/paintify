/**
 * @class LayerStack
 * instantinates a layer stack for layered images
 * handles controls and operations to work with layers
 */

class LayerStack {
  /**
   * @constructor
   * @param pStage {HTMLElement} - html element that contains generated canvas layers
   * @param pControlWrapper {HTMLElement} - html element that displays layer controls
   * @param fPropagateActive {function} - function used to set the actual canvas context
   */
  constructor(pStage, pControlWrapper, fPropagateActive) {
    this.stage = pStage;
    this.layers = [];
    this.layerControls = [];
    this.controlWrapper = pControlWrapper;
    this.propagateActive = fPropagateActive;
    this.layerIdCount = 0;

    // initialize first layer
    this.createCanvas(this.layers.length);
    // populate first layer as active layer
    this.propagateActive(this.layers[0]);
  }

  /**
   * creates a canvas element to the dom and the layer stack
   * and adds a control element for the generated canvas element
   * @returns {HTMLElement} - generated canvas element
   */
  createCanvas (){
    const stage = this.stage;
    const controlWrapper = this.controlWrapper;
    const id = `layer${this.layerIdCount}`;

    // create canvas element
    let elem = document.createElement('canvas');

    elem.setAttribute('class', 'layer');
    elem.setAttribute('id', id);
    elem.setAttribute('width', stage.clientWidth );
    elem.setAttribute('height', stage.clientHeight );

    // create layer control element
    // add childrend and add eventListeners
    let layerElem = document.createElement('div');

    layerElem.setAttribute('class', 'layer-control active');
    layerElem.setAttribute('id', `layerControl${this.layerIdCount}`);

    let layerTitle = document.createElement('div');

    layerTitle.setAttribute('class', 'layer-title');
    layerTitle.innerText = `Layer ${this.layerIdCount + 1}`;

    let layerActions = document.createElement('div');

    layerActions.setAttribute('class', 'layer-actions');

    let layerSelectAction = document.createElement('span');

    layerSelectAction.addEventListener('click', () => { this.selectLayer(id);});

    let layerSelectIcon = document.createElement('i');

    layerSelectIcon.setAttribute('class', 'fas fa-pencil-alt fa-1x layer-action');

    let layerHideAction = document.createElement('span');

    layerHideAction.setAttribute('id', `layerControlHide${this.layerIdCount}`);
    layerHideAction.addEventListener('click', () => { this.hideLayer(id);});

    let layerHideIcon = document.createElement('i');

    layerHideIcon.setAttribute('class', 'fas fa-eye fa-1x layer-action');

    let layerDeleteAction = document.createElement('span');

    layerDeleteAction.addEventListener('click', () => { this.deleteLayer(id); });

    let layerDeleteIcon = document.createElement('i');

    layerDeleteIcon.setAttribute('class', 'fas fa-trash fa-1x layer-action');

    // append
    stage.append(elem);
    this.layers.push(elem);

    // create nested layer Element
    layerSelectAction.append(layerSelectIcon);
    layerHideAction.append(layerHideIcon);
    layerDeleteAction.append(layerDeleteIcon);

    layerActions.append(layerSelectAction);
    layerActions.append(layerHideAction);
    layerActions.append(layerDeleteAction);

    layerElem.append(layerTitle);
    layerElem.append(layerActions);

    // prepend layer control above other layers
    controlWrapper.prepend(layerElem);
    this.layerControls.push(layerElem);

    this.selectLayer(id);

    this.layerIdCount++;

    return elem;
  }

  /**
   * toggles layer visibility within the stage
   * @param pId {String} - id of the html element (canvas) to be hidden
   */
  hideLayer(pId) {
    let layer = this.getLayer(pId);

    let layerControl = document.getElementById('layerControlHide'+ pId.substr(5));

    layerControl.classList.toggle('layer-invisible');
    layer.classList.toggle('hidden');
  }

  /**
   * deletes a layer based on its id
   * deletes the layer control and removes it from the layerstack
   * @param pId {String} - id of the html element (canvas) to be hidden
   */
  deleteLayer(pId) {
    let numericId = pId.substr(5);
    let layer = this.getLayer(pId);
    let layerControl = document.getElementById(`layerControl${numericId}`);

    // get the index of the layer in layers stack
    let index = this.layers.findIndex(layer => layer.id === pId);

    // remove layer from layers stack
    this.layers.splice(index, 1);
    // remove layer from dom
    layer.remove();
    // remove layer control from dom
    layerControl.remove();

    // set first layer as active layer
    this.selectLayer(this.layers[this.layers.length-1].id);
  }

  /**
   * returns a layer based on its id
   * @param pId {String} - id of the html element (canvas) to be returned
   * @returns {HTMLElement} - returns found html element or undefined
   */
  getLayer(pId){
    return this.layers.find((elem) => {
      if(elem.id === pId) {
        return elem;
      }
    });
  }

  /**
   * propagates a layer to activate its context,
   * marks layer control as active layer by adding a simple css class
   * @param pId {String} - id of the html element (canvas) to be selected
   */
  selectLayer(pId){
    const layer = this.getLayer(pId);

    this.propagateActive(layer);

    const numId = pId.substr(5);

    this.layerControls.forEach((lc) => {
      lc.classList.remove('active');
    });

    document.getElementById('layerControl' + numId).classList.add('active');
  }

  /**
   * resets the current project layerstack, controls to defaults
   */
  reset(){
    this.layers = [];
    this.layerControls = [];
    this.layerIdCount = 0;
    this.controlWrapper.innerHTML = '';
    let layers = document.querySelectorAll('.layer');

    layers.forEach( el => el.remove());
  }

  /**
   * restores a project from local storage
   * @param pProject {Array} - array of layer image data uris for the content of each layer
   */
  restore(pProject){
    // perform reset
    this.reset();
    const images = [];
    const canvases = [];

    // get image data from saved project / data uris
    // generate new canvas elements
    Object.keys(pProject).forEach(key => {
      let img = new Image;
      let canvas = this.createCanvas();

      img.src = pProject[key];
      images.push(img);
      canvases.push(canvas);
    });

    // set timeout to load images
    setTimeout(() => {
      // match images to layers
      for(let i = 0; i < images.length; i++){
        let ctx = canvases[i].getContext('2d');

        ctx.drawImage(images[i],0,0);
      }
    }, 500);
  }
}

export { LayerStack };
