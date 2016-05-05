/**
 * @fileoverview Объект, описывающий поведение картинки на странице:
 * — получение данных
 * — отрисовку на страницу
 * — добавление обработчика события на клик
 * — удаление элемента со страницы и очистку памяти
 */

'use strict';

var getPic = require('./get-pic');
var BaseComponent = require('./base-component');
var utils = require('./utils');

/**
 * @param {Object} data
 * @param {Element} container
 * @constructor
 */
var Pic = function(data, container) {
  this.data = data;
  BaseComponent.call(this, getPic(this.data, container));

  this.onClickHandler = this.onClickHandler.bind(this);

  BaseComponent.prototype.create.call(this, container);
};

utils.inherit(Pic, BaseComponent);

Pic.prototype.onClickHandler = function(event) {
  event.preventDefault();
  location.hash = utils.HASH_START + this.data.url;
};

module.exports = Pic;
