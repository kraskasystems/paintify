/**
 * function to save data to the localStorage
 * @param data {Object} - data to be stringified and stored
 * @param callback
 */

const save = function (data, callback) {
  setTimeout(() => {
    let err = null;

    try {
      localStorage.setItem('paintifyImg', JSON.stringify(data));
    } catch (e) {
      err = e;
    }
    callback(err);
  }, 1000); // fake a response delay with 1000ms
};

/**
 * function to load data from the localStorage
 * @param callback
 */

const load = function (callback) {
  setTimeout(() => {
    let err = null;
    let data;

    try {
      data = JSON.parse(localStorage.getItem('paintifyImg'));
    } catch (e) {
      err = e;
    }
    callback(err, data);
  }, 1000); // fake a response delay with 1000ms
};

export{save, load};
