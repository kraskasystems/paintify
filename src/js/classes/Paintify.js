import { Brush }              from './Brush';
import { LayerStack }         from './LayerStack';
import { save, load }         from '../util/fakeServer';
import { calculateDistance }  from '../util/calculateDistance';
import { getRandomInt }       from '../util/randomInt';

/**
 * @class Paintify
 * instantinates a paintify object that handles simple canvas painting
 */

class Paintify {
  /**
   * @constructor
   * @param {{colorSet: Object,
   *          dom: Object}} pConfig
   *
   * @param pConfig.colorSet {Array}               - array of colors <code>{ "name": "yellow", "hexValue": "FFD747"}</code>
   * @param pConfig.dom {Object}                   - HTML Element Ids to mount paintify functionality to
   * @param pConfig.dom.brush {String}             - element to trigger brush tool activation
   * @param pConfig.dom.eraser {String}            - element to trigger eraser tool activation
   * @param pConfig.dom.circle {String}            - element to trigger circle tool activation
   * @param pConfig.dom.rectangle {String}         - element to trigger rectangle tool activation
   * @param pConfig.dom.colorBomb {String}         - element to trigger color bomb tool activation
   * @param pConfig.dom.reset {String}             - element to reset to defaults
   * @param pConfig.dom.addLayer {String}          - element to add a new layer
   * @param pConfig.dom.stage {String}             - element that contains created layers
   * @param pConfig.dom.layerControl {String}      - element that contains layer controls
   * @param pConfig.dom.colorPalette {String}      - element to mount colors based on colorSet config
   * @param pConfig.dom.menuToggle {String}        - element that toggles main menu
   * @param pConfig.dom.menuClose {String}         - element that closes main menu
   * @param pConfig.dom.saveProject {String}       - button to save project to local storage
   * @param pConfig.dom.loadProject {String}       - button to load recent project from local storage
   * @param pConfig.dom.downloadImage {String}     - button to download artwork as png
   * @param pConfig.dom.downloadActiveLayer {String} - button to download recently activated layer
   */
  constructor({ config: pConfig }){
    this.config = pConfig;
    this.drawPosition = {x: 0, y: 0};
    this.distanceFrom = {x: 0, y: 0};
    this.activeTool = '';
    this.activeColor = '';
    this.activeLayer = '';
    this.actionsModal = false;
    this.domElements = {};
    this.domControls = {};

    // bind this to use method in other contexts
    this.activateLayer = this.activateLayer.bind(this);
    this.initApp();
  }

  /**
   * initializes the paintify instance based on paintify.config.json
   */
  initApp(){
    const config = this.config;
    const domElements = this.domElements;

    // get elements from dom and set configured dom elements
    Object.keys(config.dom).forEach((key) => {
      domElements[key] = document.getElementById(config.dom[key]);
    });

    // initialize brush
    this.initBrush(domElements);

    // initialize eraser
    this.initEraser(domElements);

    // initialize circle tool
    this.initCircleTool(domElements);

    // initialize rectangle tool
    this.initRectTool(domElements);

    // initialize color bomb
    this.initColorBomb(domElements);

    // initialize color palette
    this.initColorPalette(config.colorSet, domElements);

    // initialize layerstack
    this.layerStack =
      new LayerStack(
        domElements.stage,
        domElements.layerControl,
        this.activateLayer
      );

    // init stage listeners for drawing
    this.initStageListeners();

    // initialize further buttons
    domElements.reset.addEventListener('click', () => { this.layerStack.reset(); this.layerStack.createCanvas(); });
    domElements.addLayer.addEventListener('click', () => { this.layerStack.createCanvas(); });
    domElements.menuToggle.addEventListener('click', () => { this.toggleMenu(); });
    domElements.menuClose.addEventListener('click', () => { this.toggleMenu(); });
    domElements.saveProject.addEventListener('click', () => { this.saveProject(); });
    domElements.loadProject.addEventListener('click', () => { this.loadProject(); });
    domElements.downloadImage.addEventListener('click', () => { this.downloadMergedImage();});
    domElements.downloadActiveLayer.addEventListener('click', () => {this.downloadLayerImage();});
  }

  /**
   * initializes the brush tool based on Brush class
   * adds a eventlistener to html element and adds tools to instance domControls
   * @param dom {HTMLElement} - HTML Element matched to id from pConfig.dom.brush
   */

  initBrush(dom){
    // initialize paintify brush instance
    this.brush = new Brush(dom.brush);
    this.brush.element.addEventListener('click', () => {
      this.activeTool = 'brush';
      this.setActiveToolClass('brush');
    });
    this.domControls['brush'] = this.brush.element;
    this.activeTool = 'brush';
  }

  /**
   * initializes the eraser tool based on Brush class
   * adds a eventlistener to html element and adds tools to instance domControls
   * @param dom {HTMLElement} - HTML Element matched to id from pConfig.dom.eraser
   */

  initEraser(dom){
    // initialize paintify eraser instance
    this.eraser = new Brush(dom.eraser);
    this.domControls['eraser'] = this.eraser.element;
    this.eraser.element.addEventListener('click', () => {
      this.activeTool = 'eraser';
      this.setActiveToolClass('eraser');
    });
  }

  /**
   * initializes the circle tool
   * adds a eventlistener to html element and adds tools to instance domControls
   * @param dom {HTMLElement} - HTML Element matched to id from pConfig.dom.circle
   */
  initCircleTool(dom){
    dom.circle.addEventListener('click', () => {
      this.activeTool = 'circle';
      this.setActiveToolClass('circle');
    });

    this.domControls['circle'] = dom.circle;
  }

  /**
   * initializes the rectangle tool,
   * adds a eventlistener to html element and adds tools to instance domControls
   * @param dom {HTMLElement} - HTML Element matched to id from pConfig.dom.rectangle
   */
  initRectTool(dom){
    dom.rectangle.addEventListener('click', () => {
      this.activeTool = 'rectangle';
      this.setActiveToolClass('rectangle');
    });

    this.domControls['rectangle'] = dom.rectangle;
  }

  /**
   * initializes the color bomb tool,
   * adds a eventlistener to html element and adds tools to instance domControls
   * @param dom {HTMLElement} - HTML Element matched to id from pConfig.dom.colorBomb
   */
  initColorBomb(dom){
    dom.colorBomb.addEventListener('click', () => {
      this.activeTool = 'bomb';
      this.setActiveToolClass('bomb');
    });

    this.domControls['bomb'] = dom.colorBomb;
  }

  /**
   * generates color controls and mounts controls to the dom
   * @param pColorSet {Array} - array of colors set in config.colorSet
   * @param pControls {Object} - HTML Elements created from init method
   */
  initColorPalette(pColorSet, pControls){
    let i = 0;

    pColorSet.forEach((color) => {
      let elem = document.createElement('div');

      elem.setAttribute('class', 'colorElement');
      elem.setAttribute('data-value', color.hexValue);
      elem.setAttribute('id', color.name);
      elem.setAttribute('data-key', i);
      elem.setAttribute('style', `background-color: #${color.hexValue}`);

      elem.addEventListener('click', (event) => {
        this.activeColor = document.getElementById(event.target.id).getAttribute('data-value');
      });

      pControls.colorPalette.appendChild(elem);
      i++;
    });

    this.activeColor = pColorSet[0].hexValue;
  }

  /**
   * initializes stage listeners for mouse events
   */
  initStageListeners(){
    this.domElements.stage.addEventListener('mousemove', (e) => {
      this.draw(e);
      this.drawStrokeThickness(e);
    });
    this.domElements.stage.addEventListener('mousedown', (e) => {
      this.setDrawPosition(e);
      this.setMeasurePosition(e);
    });
    this.domElements.stage.addEventListener('mouseenter', (e) => {
      this.setDrawPosition(e);
    });
    this.domElements.stage.addEventListener('wheel', (e) => {
      this.setBrushSize(e);
      this.drawStrokeThickness(e);
    });
  }

  /**
   * activates a specific layer to draw on
   * @param pLayer {HTMLCanvasElement}
   */
  activateLayer(pLayer){
    this.activeLayer = pLayer;
  }

  /**
   * adds css class to active tool control
   * @param pTool {String} - tool string name
   */
  setActiveToolClass(pTool){
    const tools = this.domControls;

    Object.keys(tools).forEach((key) => {
      if(pTool === key){
        tools[key].classList.add('active');
      } else {
        tools[key].classList.remove('active');
      }
    });
  }

  /**
   * sets current mouse position
   * @param event {MouseEvent} - mousemove event delivers positional data
   */
  setDrawPosition(event){
    this.drawPosition.x = event.clientX - 70;
    this.drawPosition.y = event.clientY;
  }

  /**
   * sets current mouse position for distance measuring (circle, rectangle)
   * @param event {MouseEvent} - mousedown event delivers positional data
   */
  setMeasurePosition(event){
    this.distanceFrom.x = event.clientX - 70;
    this.distanceFrom.y = event.clientY;
  }

  /**
   * checks activated tool and recieves context from activated layer
   * @param event {MouseEvent} - mousemove
   */
  draw(event){
    if(!this.actionsModal){
      // check if a layer exists, otherwise add a new layer
      if(this.activateLayer === ''){
        this.layerStack.createCanvas();
      }

      // get active layer context
      const ctx = this.activeLayer.getContext('2d');

      // set active color as css hex value
      let color = `#${this.activeColor}`;

      if(event.buttons === 1){
        switch(this.activeTool){
        case 'eraser':
          this.erase( event, ctx);
          break;
        case 'brush':
          this.drawBrushStroke( event, ctx, color);
          break;
        case 'circle':
          this.setDrawPosition(event);
          this.drawCircle(ctx, color);
          break;
        case 'rectangle':
          this.setDrawPosition(event);
          this.drawRectangle(ctx, color);
          break;
        case 'bomb':
          this.setDrawPosition(event);
          this.drawBomb(ctx);
          break;
        }
      }
    }
  }

  /**
   * draws a brush stroke to the active layer / canvas
   * @param event {MouseEvent} - event used for positioning
   * @param ctx {CanvasRenderingContext2D} - context of active layer (canvas element)
   * @param color {String} - HEX value of color to draw with
   */
  drawBrushStroke(event, ctx, color){
    ctx.beginPath();
    ctx.lineWidth = this.brush.size;
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.moveTo(this.drawPosition.x, this.drawPosition.y);
    this.setDrawPosition(event);
    ctx.lineTo(this.drawPosition.x, this.drawPosition.y);
    ctx.stroke();
    ctx.closePath();
  }

  /**
   * erases parts of the active layer / canvas element
   * @param event {MouseEvent} - event used for positioning
   * @param ctx {CanvasRenderingContext2D} - context of active layer (canvas element)
   */
  erase(event, ctx){
    ctx.beginPath();
    ctx.lineWidth = this.eraser.size;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.moveTo(this.drawPosition.x, this.drawPosition.y);
    this.setDrawPosition(event);
    ctx.lineTo(this.drawPosition.x, this.drawPosition.y);
    ctx.stroke();
    ctx.closePath();
  }

  /**
   * draws a circle on the active layer / canvas element
   * @param ctx {CanvasRenderingContext2D} - context of active layer (canvas element)
   * @param color {String} - HEX value of color to draw with
   */
  drawCircle(ctx, color) {
    let dist = calculateDistance(this.drawPosition, this.distanceFrom);

    ctx.beginPath();
    ctx.globalCompositeOperation = 'source-over';
    ctx.arc(this.distanceFrom.x , this.distanceFrom.y , dist ,0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  }

  /**
   * draws a rectangle on the active layer / canvas element
   * @param ctx {CanvasRenderingContext2D} - context of active layer (canvas element)
   * @param color {String} - HEX value of color to draw with
   */
  drawRectangle(ctx, color) {
    let xLen = Math.abs(this.distanceFrom.x - this.drawPosition.x);
    let yLen = Math.abs(this.distanceFrom.y - this.drawPosition.y);

    ctx.beginPath();
    ctx.fillRect(this.distanceFrom.x , this.distanceFrom.y, xLen, yLen);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  }

  /**
   * draws multiple circles with various diameters and colors around mouse position
   * @param ctx {CanvasRenderingContext2D} - context of active layer (canvas element)
   */
  drawBomb(ctx){
    let colorSet = this.config.colorSet;
    let color = 0;
    let rad = 0;
    let distX = 0;
    let distY = 0;

    for(let i = 0; i < 50; i++){
      color = colorSet[getRandomInt(0, colorSet.length)].hexValue;
      rad = getRandomInt(5, 25);
      distX = getRandomInt(-250, 250);
      distY = getRandomInt(-250,250);

      ctx.beginPath();
      ctx.globalCompositeOperation = 'source-over';
      ctx.arc(this.drawPosition.x + distX, this.drawPosition.y + distY, rad ,0, Math.PI * 2);
      ctx.fillStyle = `#${color}`;
      ctx.fill();
      ctx.closePath();
    }
  }

  /**
   * sets the brush size of either brush or eraser if activated
   * @param event {MouseEvent} - wheel
   */
  setBrushSize(event){
    const activeTool = this.activeTool;
    let tool = this.brush;

    if(activeTool === 'eraser'){
      tool = this.eraser;
    }

    tool.changeBrushSize(event);
  }

  /**
   * Method to assist user while painting, displays brush or eraser dimensions
   * @param event {MouseEvent} - used to obtain mouse position
   */
  drawStrokeThickness(event){
    const thicknessElem = document.getElementById('strokeHelper');

    if(!this.actionsModal && (this.activeTool === 'brush' || this.activeTool === 'eraser')){

      const activeTool = this.activeTool;
      let tool = this.brush;

      if(activeTool === 'eraser'){
        tool = this.eraser;
      }
      let width = tool.size;
      let height = tool.size;
      let top = event.clientY - tool.size / 2;
      let left = event.clientX - 70 - tool.size / 2;

      thicknessElem.setAttribute('style', `width: ${width}px; height: ${height}px; top: ${top}px; left: ${left}px`);
    } else {
      thicknessElem.setAttribute('style', 'width: 0px; height: 0px; top: -100px; left: -100px');
    }
  }

  /**
   * saves a project to the localStorage
   */
  saveProject(){
    const layers = this.layerStack.layers;
    const project = {};

    layers.forEach( layer => {
      project[layer.id] = layer.toDataURL('image/png');
    });

    save(project, () => { alert('Project saved.'); this.toggleMenu();});
  }

  /**
   * loads a project from the localStorage
   */
  loadProject(){
    const project = (err, data) => {
      if(data !== undefined && data !== null){
        this.layerStack.restore(data, this.toggleMenu.bind(this));
      }
      else { alert('No previous saved project available.');}
    };

    load(project);
  }

  /**
   * downloads the artwork / project by merging layers to a single image png file
   */
  downloadMergedImage(){
    // create new canvas element to merge all layers
    const merged = this.layerStack.createCanvas();
    const layers = this.layerStack.layers;
    const ctx = merged.getContext('2d');

    layers.forEach((layer) => {
      ctx.drawImage(layer, 0,0);
    });

    this.downloadLayerImage();

    this.layerStack.deleteLayer(merged.id);
  }

  /**
   * downloads the active layer as png file
   */
  downloadLayerImage(){
    const image = this.activeLayer.toDataURL('image/png');
    const tmpLink = document.createElement('a');

    tmpLink.download = 'paintify.png';
    tmpLink.href = image;

    document.body.appendChild(tmpLink);
    tmpLink.click();
    document.body.removeChild(tmpLink);
  }

  /**
   * toggles the menu
   */
  toggleMenu() {
    if(this.actionsModal){
      this.actionsModal = false;
      document.getElementById('actionsModal').classList.add('closed');
    } else {
      this.actionsModal = true;
      document.getElementById('actionsModal').classList.remove('closed');
    }
  }
}

export { Paintify };
