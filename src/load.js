/**
 * @fileoverview Универсальный метод для загрузки данных
 */

'use strict';

/**
 * @param {HTMLElement} container
 * @param {string} url
 * @param {number} timeout
 * @param {function(Object)} callback
 */
var loadPics = function(container, timeout, url, callback) {
  var xhr = new XMLHttpRequest();

  // Отображаем прелоадер пока идёт загрузка
  xhr.onloadstart = function() {
    container.classList.add('pictures-loading');
  };

  // Скрываем прелоадер по завершению загрузки
  xhr.onloadend = function() {
    container.classList.remove('pictures-loading');
  };

  /** @param {ProgressEvent} */
  xhr.onload = function(evt) {
    var loadedData = JSON.parse(evt.target.response);
    callback(loadedData);
  };

  xhr.timeout = timeout;

  // Таймаут или какая-то другая ошибка загрузки
  xhr.ontimeout = xhr.onerror = function() {
    container.classList.add('pictures-failure');
  };

  xhr.open('GET', url);
  xhr.send();
};

module.exports = loadPics;
