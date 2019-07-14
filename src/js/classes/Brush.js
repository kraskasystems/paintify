/**
 * @class Brush
 * instantinates a simple brush
 */

class Brush {
  /**
   * @constructor
   * @param {HTMLElement} pElement - html element acting as control to activate the tool
   */
  constructor(pElement){
    this.element = pElement;
    this.size = 3;
  }

  /**
   * method used to change the size of the brush
   * @param {event} event - wheel event that triggered method call
   */
  changeBrushSize(event) {

    if(event.deltaY < 0 && this.size < 200){
      this.size++;
    }

    if(event.deltaY > 0 && this.size > 1){
      this.size--;
    }
  }
}

export { Brush };
