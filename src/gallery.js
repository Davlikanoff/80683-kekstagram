/**
 * @fileoverview Компонент галереи
 */

'use strict';

/** @constructor */
var Gallery = function() {
  var self = this;

  this.element = document.querySelector('.gallery-overlay');

  var img = this.element.querySelector('img');
  var imgComments = this.element.querySelector('.comments-count');
  var imgLikes = this.element.querySelector('.likes-count');

  this.pictures = [];
  this.activePicture = 0;

  //Функция показа конкретной фотографии по номеру в массиве
  this.showPic = function(num) {
    // проверяем не на последнем ли мы элементе
    // если да, то прыгаем снова на первый
    self.activePicture = (num >= self.pictures.length) ? 0 : num;

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
      self.showPic(self.activePicture);
    }
  };

  //Закрытие галереи по нажатию ESC
  this.onDocumentKeyDownHandler = function(event) {
    if(event.keyCode === 27) {
      self.hide();
    }
  };

  this.hide = function() {
    this.element.classList.add('invisible');

    document.removeEventListener('keydown', this.onDocumentKeyDownHandler);
    img.removeEventListener('click', this.onPhotoClickHandler);
    this.element.removeEventListener('click', this.onOverlayClickHandler);
    this.element.removeEventListener('keydown', this.onDocumentKeyDownHandler);
  };

  this.getPics = function(initialPics) {
    this.pictures = initialPics;
  };

  this.show = function(num) {
    this.showPic(num);
    this.element.classList.remove('invisible');

    document.addEventListener('keydown', this.onDocumentKeyDownHandler);
    img.addEventListener('click', this.onPhotoClickHandler);
    this.element.addEventListener('click', this.onOverlayClickHandler);
    this.element.addEventListener('keydown', this.onDocumentKeyDownHandler);
  };
};

module.exports = new Gallery();
