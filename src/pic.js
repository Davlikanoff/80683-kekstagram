/**
 * @fileoverview Объект, описывающий поведение картинки на странице:
 * — получение данных
 * — отрисовку на страницу
 * — добавление обработчика события на клик
 * — удаление элемента со страницы и очистку памяти
 */

'use strict';

var getPic = require('./get-pic');

var hashStart = '#photo/';

/**
 * @param {Object} data
 * @param {Element} container
 * @param {number} num
 * @constructor
 */
var Pic = function(data, container, num) {
  this.data = data;
  this.element = getPic(this.data, container);
  this.num = num; // порядковый номер фотографии элемента, в массиве фотографий

  this.onPicClick = this.onPicClick.bind(this);

  this.element.addEventListener('click', this.onPicClick);
};

Pic.prototype.onPicClick = function(event) {
  event.preventDefault();
  location.hash = hashStart + this.data.url;
};

Pic.prototype.remove = function() {
  this.element.removeEventListener('click', this.onPicClick);
  this.element.parentNode.removeChild(this.element);
};

module.exports = Pic;
