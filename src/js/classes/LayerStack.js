class LayerStack {
  constructor(pStage, pControlWrapper, fPropagateActive) {
    this.stage = pStage;
    this.layers = [];
    this.layerControls = [];
    this.controlWrapper = pControlWrapper;
    this.propagateActive = fPropagateActive;
    this.layerIdCount = 0;

    // initialize first layer
    this.createCanvas(this.layers.length);
  }

  createCanvas (){
    const stage = this.stage;
    const controlWrapper = this.controlWrapper;
    const id = `layer${this.layerIdCount}`;

    let elem = document.createElement('canvas');

    elem.setAttribute('class', 'layer');
    elem.setAttribute('id', id);
    elem.setAttribute('width', stage.clientWidth );
    elem.setAttribute('height', stage.clientHeight );

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

    layerHideAction.addEventListener('click', () => { this.hideLayer(id);});

    let layerHideIcon = document.createElement('i');

    layerHideIcon.setAttribute('class', 'fas fa-eye fa-1x layer-action');

    let layerDeleteAction = document.createElement('span');

    layerDeleteAction.addEventListener('click', () => { this.deleteLayer(id); });

    let layerDeleteIcon = document.createElement('i');

    layerDeleteIcon.setAttribute('class', 'fas fa-trash fa-1x layer-action');

    stage.appendChild(elem);
    this.layers.push(elem);

    // create nested layer Element
    layerSelectAction.appendChild(layerSelectIcon);
    layerHideAction.appendChild(layerHideIcon);
    layerDeleteAction.appendChild(layerDeleteIcon);

    layerActions.appendChild(layerSelectAction);
    layerActions.appendChild(layerHideAction);
    layerActions.appendChild(layerDeleteAction);

    layerElem.appendChild(layerTitle);
    layerElem.appendChild(layerActions);

    controlWrapper.appendChild(layerElem);
    this.layerControls.push(layerElem);

    this.selectLayer(id);

    this.layerIdCount++;
  }

  hideLayer(pId) {
    let layer = this.getLayer(pId);

    layer.classList.toggle('hidden');
  }

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
    this.propagateActive(this.layers[0]);

  }

  getLayer(pId){
    return this.layers.find((elem) => {
      if(elem.id === pId) {
        return elem;
      }
    });
  }

  selectLayer(pId){
    const layer = this.getLayer(pId);

    this.propagateActive(layer);

    const numId = pId.substr(5);

    this.layerControls.forEach((lc) => {
      lc.classList.remove('active');
    });

    document.getElementById('layerControl' + numId).classList.add('active');
  }

}

export { LayerStack };
