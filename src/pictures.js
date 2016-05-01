'use strict';

var load = require('./load');
var sort = require('./sort');
var getPic = require('./get-pic');
var gallery = require('./gallery');
var utils = require('./utils');

(function() {
  //Ссылка на файл, содержащий массив данных о картинках
  /** @constant {string} */
  var URL_PICS_LOAD = '//o0.github.io/assets/json/pictures.json';

  /** @constant {number} */
  var IMAGE_LOAD_TIMEOUT = 10000;

  /** @constant {number} */
  var SCROLL_TIMEOUT = 100;

  /** @constant {number} */
  var PAGE_SIZE = 12;

  /** @type {number} */
  var pageNumber = 0;

  // Картинки в том порядке, в котором они на сервере
  var pictures = [];

  // Здесь будут храниться картинки в отсортированном порядке
  var sortedPics = [];

  //var filterBlock = document.forms['upload-filter'];
  var picsSortContainer = document.forms[0];

  // Блок-контейнер, куда будут выводиться картинки
  var picsContainer = document.querySelector('.pictures');

  // Сортируем картинки и выводим их на экран
  var setSorter = function(sorting) {
    sortedPics = sort(pictures, sorting);
    gallery.getPics(sortedPics);

    pageNumber = 0;
    renderPics(sortedPics, pageNumber, true);
  };

  // Назначаем радиобатонам отработку сортировки по клику
  // и по нажатию клавиш пробела или Enter
  var setSortingEnabled = function() {
    picsSortContainer.addEventListener('click', function(event) {
      if (event.target.name === 'filter') {
        setSorter(event.target.value);
      }
    });

    picsSortContainer.addEventListener('keydown', function(event) {
      if ((event.target.name === 'filter') && [13, 32].indexOf(event.keyCode) > -1) {
        event.preventDefault();
        setSorter(event.target.value);
      }
    });
  };

  var renderPics = function(pics, page, clear) {
    if(clear) {
      // Очищаем контейнер с картинками перед очередным показом
      picsContainer.innerHTML = '';
    }

    var from = page * PAGE_SIZE;
    var to = from + PAGE_SIZE;

    pics.slice(from, to).forEach(function(pic) {
      getPic(pic, picsContainer);
    });

    // Проверяем, есть ли пустое пространство между последней показанной строкой картинок
    // и если есть, значит экран большой и надо вывести ещё порцию картинок,
    if(utils.isBottomReached(picsContainer) && utils.isNextPageAvailable(pics, pageNumber, PAGE_SIZE)) {
      pageNumber++; // берём следующую страницу с картинками
      renderPics(pics, pageNumber, false);
    }
  };

  var setScrollEnabled = function() {
    window.addEventListener('scroll', utils.throttle(function() {
      if (utils.isBottomReached(picsContainer) && utils.isNextPageAvailable(pictures, pageNumber, PAGE_SIZE)) {
        pageNumber++;
        renderPics(sortedPics, pageNumber, false);
      }
    }, SCROLL_TIMEOUT));
  };

  utils.setItemHidden(picsSortContainer, true);

  load(picsContainer, IMAGE_LOAD_TIMEOUT, URL_PICS_LOAD, function(loadedPics) {
    // Получаем изначальный массив картинок
    pictures = loadedPics;
    setSorter('popular');
    utils.setItemHidden(picsContainer, false);
    setSortingEnabled();
    setScrollEnabled();
  });

  picsContainer.addEventListener('click', function(event) {
    var sortedPicsImages = sortedPics.map(function(a) {
      return a.url;
    });
    var item = event.target;
    var imgParentItem, imgItem;
    var picNum;

    if(item.tagName === 'A') {
      imgParentItem = item;
    } else if(item.parentNode.tagName === 'A') {
      imgParentItem = item.parentNode;
    } else if(item.parentNode.tagName === 'SPAN') {
      imgParentItem = item.parentNode.parentNode;
    }

    imgItem = imgParentItem.querySelector('img');
    picNum = sortedPicsImages.indexOf(imgItem.getAttribute('src'));

    event.preventDefault();
    if (picNum >= 0) {
      gallery.showGallery(picNum);
    }
  });

  utils.setItemHidden(picsSortContainer, false);
})();
