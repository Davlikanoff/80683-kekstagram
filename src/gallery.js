/**
 * @fileoverview Компонент галереи
 */

'use strict';

var hashStart = '#photo/';

/** @constructor */
var Gallery = function() {
  var self = this;

  this.element = document.querySelector('.gallery-overlay');

  var img = this.element.querySelector('img');
  var imgComments = this.element.querySelector('.comments-count');
  var imgLikes = this.element.querySelector('.likes-count');

  this.pictures = [];
  // массив, в котором будут хранится только пути к фотографиям
  this.picturesURL = [];
  this.activePicture = 0;

  // Функция показа конкретной фотографии по номеру в массиве
  // или по пути к фотографии
  this.showPic = function(photo) {
    if (typeof (photo) === 'string') {
      self.activePicture = self.picturesURL.indexOf(photo);
    } else {
      // проверяем не на последнем ли мы элементе
      // если да, то прыгаем снова на первый
      self.activePicture = (photo >= self.pictures.length) ? 0 : photo;
    }

    img.src = self.pictures[self.activePicture].url;
    imgComments.textContent = self.pictures[self.activePicture].comments;
    imgLikes.textContent = self.pictures[self.activePicture].likes;
  };

  //Закрытие галереи по клику на тёмную область вокруг фото
  this.onOverlayClickHandler = function(event) {
    if(event.target.classList.contains('gallery-overlay')) {
      self.hide();
    }
  };

  //Показ следующей фотки по клику на текущее фото
  this.onPhotoClickHandler = function(event) {
    if(event.target.classList.contains('gallery-overlay-image')) {
      self.activePicture++;

      if (self.activePicture >= self.pictures.length) {
        self.activePicture = 0;
      }

      location.hash = hashStart + self.picturesURL[self.activePicture];
    }
  };

  //Закрытие галереи по нажатию ESC
  this.onDocumentKeyDownHandler = function(event) {
    if(event.keyCode === 27) {
      self.hide();
    }
  };

  this.hide = function() {
    location.hash = '';
    this.element.classList.add('invisible');

    document.removeEventListener('keydown', this.onDocumentKeyDownHandler);
    img.removeEventListener('click', this.onPhotoClickHandler);
    this.element.removeEventListener('click', this.onOverlayClickHandler);
    this.element.removeEventListener('keydown', this.onDocumentKeyDownHandler);
  };

  this.getPics = function(initialPics) {
    this.pictures = initialPics;
    this.picturesURL = this.pictures.map(function(picture) {
      return picture.url;
    });
  };

  this.show = function(photo) {
    this.showPic(photo);
    this.element.classList.remove('invisible');

    document.addEventListener('keydown', this.onDocumentKeyDownHandler);
    img.addEventListener('click', this.onPhotoClickHandler);
    this.element.addEventListener('click', this.onOverlayClickHandler);
    this.element.addEventListener('keydown', this.onDocumentKeyDownHandler);
  };

  // Следим за хэшем адресной строки и реагируем на изменения
  this.onLocationHashCheck = function() {
    var photoPath = location.hash.match(/#photo\/(\S+)/);
    if (photoPath !== null) {
      self.show(photoPath[1]);
    }
  };

  window.addEventListener('hashchange', this.onLocationHashCheck);
  window.addEventListener('load', this.onLocationHashCheck);
};

module.exports = new Gallery();
