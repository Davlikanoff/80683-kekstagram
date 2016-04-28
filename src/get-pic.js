/**
 * @fileoverview Шаблон картинки и функция отрисовки картинки на основе
 * шаблона с определенным набором данных
 */

'use strict';

/** @constant {number} */
var IMAGE_LOAD_TIMEOUT = 10000;

// Шаблон для вывода элемента картинки
var picTemplate = document.getElementById('picture-template');
var itemToClone;

if ('content' in picTemplate) {
  itemToClone = picTemplate.content.querySelector('.picture');
} else {
  itemToClone = picTemplate.querySelector('.picture');
}

/**
 * @param {Object} data
 * @param {HTMLElement} container
 * @return {HTMLElement}
 */
var getPicItem = function(data, container) {
  var item = itemToClone.cloneNode(true);
  var itemPic = item.querySelector('img');
  item.querySelector('.picture-comments').textContent = data.comments;
  item.querySelector('.picture-likes').textContent = data.likes;

  var tmpImage = new Image();
  var imageLoadTimeout;

  tmpImage.onload = function() {
    clearTimeout(imageLoadTimeout);
    itemPic.src = data.url;
  };

  tmpImage.onerror = function() {
    item.classList.add('picture-load-failure');
  };

  tmpImage.src = data.url;

  imageLoadTimeout = setTimeout(function() {
    tmpImage = null;
    item.src = '';
    item.classList.add('picture-load-failure');
  }, IMAGE_LOAD_TIMEOUT);

  container.appendChild(item);

  return item;
};

module.exports = getPicItem;
