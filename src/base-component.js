/**
 * @fileoverview Общий коструктор для компонент:
 * - создание объекта (конструктор)
 * - создание DOM-разметки и добавление ее на страницу. Добавление обработчиков
 * - удаление элемента из разметки, удаление обработчиков, подготовка к удалению элемента из памяти
 */

'use strict';

/** @constructor */
var BaseComponent = function(element) {
  this.element = element;
};

BaseComponent.prototype.create = function(container) {
  if (container) {
    container.appendChild(this.element);
  }

  if(this.onClickHandler) {
    this.element.addEventListener('click', this.onClickHandler);
  }

  if(this.onKeyDownHandler) {
    document.addEventListener('keydown', this.onKeyDownHandler);
    this.element.addEventListener('keydown', this.onKeyDownHandler);
  }
};

BaseComponent.prototype.remove = function(erase) {
  if(this.onClickHandler) {
    this.element.removeEventListener('click', this.onClickHandler);
  }

  if(this.onKeyDownHandler) {
    document.removeEventListener('keydown', this.onKeyDownHandler);
    this.element.removeEventListener('keydown', this.onKeyDownHandler);
  }

  if (erase) {
    this.element.parentNode.removeChild(this.element);
    this.element = null;
  }
};

module.exports = BaseComponent;
