/**
 * @fileoverview Вспомогательные методы
 */

'use strict';

/** @constant {string} */
var HIDDEN_CLASSNAME = 'hidden';

module.exports = {
  /**
   * @param {month} number
   * @param {date} number
   */
  cookiesLifeTime: function(month, date) {
    var currentDate = new Date();
    var currentMonth = currentDate.getMonth(currentDate) + 1;
    var currentDay = currentDate.getDate(currentDate);
    var lastBirthday = new Date(currentDate.getFullYear(), month - 1, date);
    var diff;

    //Если ДР ещё не наступило, то считаем разницу с прошлого года
    if ( (month > currentMonth) || (month === currentMonth && date > currentDay ) ) {
      lastBirthday.setFullYear(currentDate.getFullYear() - 1);
    }

    //Если ДР сегодня, то срок жизни куки 23:59:59, начиная с текущего времени
    if ( (month === currentMonth) && (date === currentDay) ) {
      diff = (23 * 3600 + 59 * 60 + 59) * 1000;
    } else {
      diff = currentDate - lastBirthday;
    }

    var result = new Date(+currentDate + diff).toUTCString();
    return result;
  },

  /**
   * @param {Node} container
   * @return {boolean}
   */
  isBottomReached: function(container) {
    // Нижняя граница контейнера с картинками
    var containerBottom = container.getBoundingClientRect().bottom;
    // Высота вьюпорта
    var screenHeight = window.innerHeight;
    return (screenHeight - containerBottom) >= 0;
  },

  /**
   * @param {Array} pics
   * @param {number} page
   * @param {number} pageSize
   * @return {boolean}
   */
  isNextPageAvailable: function(pics, page, pageSize) {
    return page < Math.floor(pics.length / pageSize);
  },

  /**
   * @param {Element} item
   * @param {boolean} hidden
   */
  setItemHidden: function(item, hidden) {
    item.classList.toggle(HIDDEN_CLASSNAME, hidden);
  },

  /**
   * @param {Function} fn
   * @param {number} timeout
   * @return {Function} [description]
   */
  throttle: function(fn, timeout) {
    return function() {
      clearTimeout(fn._timeoutID);
      fn._timeoutID = setTimeout(fn, timeout);
    };
  }
};
