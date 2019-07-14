/**
 * function to generate a random integer value
 * @param min {number} - minimum value
 * @param max {number} - maximum value
 * @returns {number}
 */

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min +1)) + min;
};

export {getRandomInt};
