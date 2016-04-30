/**
 * @fileoverview Модуль, отвечающий за показ фотографий в полном размере
 */

'use strict';

var pics = [];

/** @type {number} */
var activePic = 0;

/** @type {HTMLElement} */
var galleryContainer = document.querySelector('.gallery-overlay');

/** @type {HTMLElement} */
var galleryImg = galleryContainer.querySelector('img');

/** @type {HTMLElement} */
var galleryImgComments = galleryContainer.querySelector('.comments-count');

/** @type {HTMLElement} */
var galleryImgLikes = galleryContainer.querySelector('.likes-count');

//Функция показа конкретной фотографии по номеру в массиве
var showGalleryPic = function(num) {
  // проверяем не на последнем ли мы элементе
  // если да, то прыгаем снова на первый
  activePic = (num >= pics.length) ? 0 : num;

  galleryImg.src = pics[activePic].url;
  galleryImgComments.textContent = pics[activePic].comments;
  galleryImgLikes.textContent = pics[activePic].likes;
};

//Функция показа следующей фотки по клику на текущее фото
var _onPhotoClick = function(event) {
  if(event.target.classList.contains('gallery-overlay-image')) {
    activePic++;
    showGalleryPic(activePic);
  }
};

//Функция закрытия галереи по нажатию ESC
var _onDocumentKeyDown = function(event) {
  if(event.keyCode === 27) {
    hideGallery();
  }
};

var hideGallery = function() {
  galleryContainer.classList.add('invisible');

  document.removeEventListener('keydown', _onDocumentKeyDown);
  galleryContainer.removeEventListener('click', _onPhotoClick);
  galleryContainer.removeEventListener('keydown', _onDocumentKeyDown);
};

galleryContainer.addEventListener('click', function(event) {
  if(event.target.classList.contains('gallery-overlay')) {
    hideGallery();
  }
});

module.exports = {
  getPics: function(arr) {
    pics = arr;
  },
  showGallery: function(num) {
    showGalleryPic(num);
    galleryContainer.classList.remove('invisible');

    document.addEventListener('keydown', _onDocumentKeyDown);
    galleryContainer.addEventListener('click', _onPhotoClick);
    galleryContainer.addEventListener('keydown', _onDocumentKeyDown);
  }
};
