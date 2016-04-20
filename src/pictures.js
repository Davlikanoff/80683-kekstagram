'use strict';

(function() {
  var pictures = [];
  var filterBlock = document.forms['upload-filter'];
  filterBlock.classList.add('hidden');

  var picsSortContainer = document.forms[0];
  var picsSorters = picsSortContainer.elements['filter'];

  /**
  * @param {Array.<Object>} hotels
  * @param {Filter} filter
  */
  var getSortedPics = function(pics, sorting) {
    var picsToSort = pics.slice(0);

    switch (sorting) {
      case 'new':
        picsToSort.sort(function(a, b) {
          var aDate = new Date(a.date).getTime();
          var bDate = new Date(b.date).getTime();

          return bDate - aDate;
        });
        break;
      case 'discussed':
        picsToSort.sort(function(a, b) {
          return b.comments - a.comments;
        });
        break;
      case 'popular':
      default:
        picsToSort.sort(function(a, b) {
          return b.likes - a.likes;
        });
    }

    return picsToSort;
  };

  // Сортируем картинки и выводим их на экран
  var setSorter = function(sorting) {
    var sortedPics = getSortedPics(pictures, sorting);

    renderPics(sortedPics);
  };

  // Назначаем всем радиобатонам сортировки одинаковое событие по клику
  // отличие только в параметре value, передаваемом в функцию вывода отсортированных картинок
  var setSortingEnabled = function() {
    for(var i = 0; i < picsSorters.length; i++) {
      picsSorters[i].onclick = function() {
        setSorter(this.value);
      };
    }
  };

  var picsContainer = document.querySelector('.pictures');
  var picTemplate = document.getElementById('picture-template');
  var itemToClone;

  if ('content' in picTemplate) {
    itemToClone = picTemplate.content.querySelector('.picture');
  } else {
    itemToClone = picTemplate.querySelector('.picture');
  }

  /** @constant {number} */
  var IMAGE_LOAD_TIMEOUT = 10000;

  var getPicItem = function(data, container) {
    var item = itemToClone.cloneNode(true);
    var itemPic = item.querySelector('img');
    item.querySelector('.picture-comments').textContent = data.comments;
    item.querySelector('.picture-likes').textContent = data.likes;
    container.appendChild(item);

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
      item.src = '';
      item.classList.add('picture-load-failure');
    }, IMAGE_LOAD_TIMEOUT);

    return item;
  };

  var renderPics = function(pics) {
    // Очищаем контейнер с картинками перед очередным показом
    picsContainer.innerHTML = '';

    pics.forEach(function(pic) {
      getPicItem(pic, picsContainer);
    });
  };

  //Ссылка на файл, содержащий массив данных о картинках
  /** @constant {string} */
  var URL_PICS_LOAD = '//o0.github.io/assets/json/pictures.json';

  // Скачиваем массив данных о картинках
  /** @param {function(Array.<Object>)} callback */
  var getPics = function(callback) {
    var xhr = new XMLHttpRequest();

    // Отображаем прелоадер пока идёт загрузка
    xhr.onloadstart = function() {
      picsContainer.classList.add('pictures-loading');
    };

    // Скрываем прелоадер по завершению загрузки
    xhr.onloadend = function() {
      picsContainer.classList.remove('pictures-loading');
    };

    /** @param {ProgressEvent} */
    xhr.onload = function(evt) {
      var loadedData = JSON.parse(evt.target.response);
      callback(loadedData);
    };

    xhr.timeout = 10000; //таймаут 10 секунд

    // Таймаут или какая-то другая ошибка загрузки
    xhr.ontimeout = xhr.onerror = function() {
      picsContainer.classList.add('pictures-failure');
    };

    xhr.open('GET', URL_PICS_LOAD);
    xhr.send();
  };

  getPics(function(loadedPics) {
    pictures = loadedPics;
    renderPics(pictures);
    picsSortContainer.classList.remove('hidden');
  });

  setSortingEnabled();
  filterBlock.classList.remove('hidden');
})();
