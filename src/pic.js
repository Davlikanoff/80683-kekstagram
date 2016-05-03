/**
 * @fileoverview Объект, описывающий поведение картинки на странице:
 * — получение данных
 * — отрисовку на страницу
 * — добавление обработчика события на клик
 * — удаление элемента со страницы и очистку памяти
 */

'use strict';

var getPic = require('./get-pic');
var gallery = require('./gallery');

/**
 * @param {Object} data
 * @param {Element} container
 * @param {number} num
 * @constructor
 */
var Pic = function(data, container, num) {
  var self = this;
  this.data = data;
  this.element = getPic(this.data, container);
  this.num = num; // порядковый номер фотографии элемента, в массиве фотографий

  this.onPicClick = function(event) {
    event.preventDefault();
    gallery.show(self.num);
  };

  this.remove = function() {
    this.element.removeEventListener('click', this.onPicClick);
    this.element.parentNode.removeChild(this.element);
  };

  this.element.addEventListener('click', this.onPicClick);
};

module.exports = Pic;
