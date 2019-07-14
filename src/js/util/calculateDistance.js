/**
 * calculates the distance between 2 positions
 * @param p1 {Object} - x and y coordinate of point 1
 * @param p2 {Object} - x and y coordinate of point 2
 * @returns {number}
 */

const calculateDistance = function (p1 = {x: 0, y: 0}, p2 = {x: 0, y: 0})
{
  let
    xLen = Math.pow((p2.x - p1.x), 2),
    yLen = Math.pow((p2.y - p1.y), 2);

  return Math.sqrt(xLen + yLen);
};

export { calculateDistance };
