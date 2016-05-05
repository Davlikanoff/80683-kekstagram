/**
 * @fileoverview Компонент галереи
 */

'use strict';

var BaseComponent = require('./base-component');
var utils = require('./utils');

/** @constructor */
var Gallery = function() {
  BaseComponent.call(this, document.querySelector('.gallery-overlay'));

  this.img = this.element.querySelector('img');
  this.imgComments = this.element.querySelector('.comments-count');
  this.imgLikes = this.element.querySelector('.likes-count');

  this.pictures = [];
  // массив, в котором будут хранится только пути к фотографиям
  this.picturesURL = [];
  this.activePicture = 0;

  // Общие функции компонент от BaseComponent
  this.onClickHandler = this.onClickHandler.bind(this);
  this.onKeyDownHandler = this.onKeyDownHandler.bind(this);

  // Уникальные функции конструктора
  this.showPic = this.showPic.bind(this);
  this.hide = this.hide.bind(this);
  this.getPics = this.getPics.bind(this);
  this.show = this.show.bind(this);
  this.onLocationHashCheck = this.onLocationHashCheck.bind(this);

  window.addEventListener('hashchange', this.onLocationHashCheck);
  window.addEventListener('load', this.onLocationHashCheck);
};

// Функция показа конкретной фотографии по номеру в массиве
// или по пути к фотографии
Gallery.prototype.showPic = function(photo) {
  if (typeof (photo) === 'string') {
    photo = this.picturesURL.indexOf(photo);
  }
  // Если фото не найдено, то не показываем галерею
  if (photo < 0) {
    this.hide();
    return;
  } else {
    // проверяем не на последнем ли мы элементе
    // если да, то прыгаем снова на первый
    this.activePicture = (photo >= this.pictures.length) ? 0 : photo;
  }

  this.img.src = this.pictures[this.activePicture].url;
  this.imgComments.textContent = this.pictures[this.activePicture].comments;
  this.imgLikes.textContent = this.pictures[this.activePicture].likes;
};

// Обработчки кликов компоненты
Gallery.prototype.onClickHandler = function(event) {
  var elClassList = event.target.classList;

  if(elClassList.contains('gallery-overlay-image')) {
    this.activePicture++;

    if (this.activePicture >= this.pictures.length) {
      this.activePicture = 0;
    }

    location.hash = utils.HASH_START + this.picturesURL[this.activePicture];
  } else if(elClassList.contains('gallery-overlay') || elClassList.contains('gallery-overlay-close')) {
    this.hide();
  }
};

//Закрытие галереи по нажатию ESC
Gallery.prototype.onKeyDownHandler = function(event) {
  if(event.keyCode === 27) {
    this.hide();
  }
};

Gallery.prototype.hide = function() {
  location.hash = '';
  this.element.classList.add('invisible');

  BaseComponent.prototype.remove.call(this, false);
};

Gallery.prototype.getPics = function(initialPics) {
  this.pictures = initialPics;
  this.picturesURL = this.pictures.map(function(picture) {
    return picture.url;
  });
};

Gallery.prototype.show = function(photo) {
  this.showPic(photo);
  this.element.classList.remove('invisible');

  BaseComponent.prototype.create.call(this);
};

// Следим за хэшем адресной строки и реагируем на изменения
Gallery.prototype.onLocationHashCheck = function() {
  var photoPath = location.hash.match(/#photo\/(\S+)/);
  if (photoPath !== null) {
    this.show(photoPath[1]);
  }
};

module.exports = new Gallery();
