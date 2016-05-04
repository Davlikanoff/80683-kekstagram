/**
 * @fileoverview Компонент галереи
 */

'use strict';

var hashStart = '#photo/';

/** @constructor */
var Gallery = function() {
  this.element = document.querySelector('.gallery-overlay');

  this.img = this.element.querySelector('img');
  this.imgComments = this.element.querySelector('.comments-count');
  this.imgLikes = this.element.querySelector('.likes-count');

  this.pictures = [];
  // массив, в котором будут хранится только пути к фотографиям
  this.picturesURL = [];
  this.activePicture = 0;

  this.showPic = this.showPic.bind(this);
  this.hide = this.hide.bind(this);
  this.onPhotoClickHandler = this.onPhotoClickHandler.bind(this);
  this.onOverlayClickHandler = this.onOverlayClickHandler.bind(this);
  this.onDocumentKeyDownHandler = this.onDocumentKeyDownHandler.bind(this);
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
    this.activePicture = this.picturesURL.indexOf(photo);
  } else {
    // проверяем не на последнем ли мы элементе
    // если да, то прыгаем снова на первый
    this.activePicture = (photo >= this.pictures.length) ? 0 : photo;
  }

  this.img.src = this.pictures[this.activePicture].url;
  this.imgComments.textContent = this.pictures[this.activePicture].comments;
  this.imgLikes.textContent = this.pictures[this.activePicture].likes;
};

//Показ следующей фотки по клику на текущее фото
Gallery.prototype.onPhotoClickHandler = function(event) {
  if(event.target.classList.contains('gallery-overlay-image')) {
    this.activePicture++;

    if (this.activePicture >= this.pictures.length) {
      this.activePicture = 0;
    }

    location.hash = hashStart + this.picturesURL[this.activePicture];
  }
};

//Закрытие галереи по клику на тёмную область вокруг фото
Gallery.prototype.onOverlayClickHandler = function(event) {
  if(event.target.classList.contains('gallery-overlay')) {
    this.hide();
  }
};

//Закрытие галереи по нажатию ESC
Gallery.prototype.onDocumentKeyDownHandler = function(event) {
  if(event.keyCode === 27) {
    this.hide();
  }
};

Gallery.prototype.hide = function() {
  location.hash = '';
  this.element.classList.add('invisible');

  document.removeEventListener('keydown', this.onDocumentKeyDownHandler);
  this.img.removeEventListener('click', this.onPhotoClickHandler);
  this.element.removeEventListener('click', this.onOverlayClickHandler);
  this.element.removeEventListener('keydown', this.onDocumentKeyDownHandler);
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

  document.addEventListener('keydown', this.onDocumentKeyDownHandler);
  this.img.addEventListener('click', this.onPhotoClickHandler);
  this.element.addEventListener('click', this.onOverlayClickHandler);
  this.element.addEventListener('keydown', this.onDocumentKeyDownHandler);
};

// Следим за хэшем адресной строки и реагируем на изменения
Gallery.prototype.onLocationHashCheck = function() {
  var photoPath = location.hash.match(/#photo\/(\S+)/);
  if (photoPath !== null) {
    this.show(photoPath[1]);
  }
};

module.exports = new Gallery();
