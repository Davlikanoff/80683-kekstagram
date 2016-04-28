/**
 * @fileoverview Функция сортировки списка
 */

'use strict';

var SortType = require('./sort-type');

/**
 * @param {Array.<Object>} pics
 * @param {SortType} sortType
 * @return {Array.<Object>}
 */
var getSortedPics = function(pics, sortType) {
  var picsToSort = pics.slice(0);

  switch (sortType) {
    case SortType.NEW:
      picsToSort.sort(function(a, b) {
        var aDate = new Date(a.date).getTime();
        var bDate = new Date(b.date).getTime();

        return bDate - aDate;
      });
      break;
    case SortType.DISCUSSED:
      picsToSort.sort(function(a, b) {
        return b.comments - a.comments;
      });
      break;
    case SortType.POPULAR:
    default:
      picsToSort.sort(function(a, b) {
        return b.likes - a.likes;
      });
  }

  return picsToSort;
};

module.exports = getSortedPics;
