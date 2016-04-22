'use strict';

(function() {
  //Ссылка на файл, содержащий массив данных о картинках
  /** @constant {string} */
  var URL_PICS_LOAD = '//o0.github.io/assets/json/pictures.json';

  /** @constant {number} */
  var IMAGE_LOAD_TIMEOUT = 10000;

  /** @constant {number} */
  var PAGE_SIZE = 12;

  /** @type {number} */
  var pageNumber = 0;

  // Картинки в том порядке, в котором они на сервере
  var pictures = [];

  // Здесь будут храниться картинки в отсортированном порядке
  var sortedPics = [];

  var filterBlock = document.forms['upload-filter'];
  var picsSortContainer = document.forms[0];

  // Блок-контейнер, куда будут выводиться картинки
  var picsContainer = document.querySelector('.pictures');
  // Шаблон для вывода элемента картинки
  var picTemplate = document.getElementById('picture-template');
  var itemToClone;

  if ('content' in picTemplate) {
    itemToClone = picTemplate.content.querySelector('.picture');
  } else {
    itemToClone = picTemplate.querySelector('.picture');
  }

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
    sortedPics = getSortedPics(pictures, sorting);

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

  /** @return {boolean} */
  var isBottomReached = function() {
    // Нижняя граница контейнера с картинками
    var containerBottom = picsContainer.getBoundingClientRect().bottom;
    // Высота вьюпорта
    var screenHeight = window.innerHeight;
    return (screenHeight - containerBottom) >= 0;
  };

  /**
 * @param {Array} pics
 * @param {number} page
 * @param {number} pageSize
 * @return {boolean}
 */
  var isNextPageAvailable = function(pics, page, pageSize) {
    return page < Math.floor(pics.length / pageSize);
  };

  var renderPics = function(pics, page, clear) {
    if(clear) {
      // Очищаем контейнер с картинками перед очередным показом
      picsContainer.innerHTML = '';
    }

    var from = page * PAGE_SIZE;
    var to = from + PAGE_SIZE;

    pics.slice(from, to).forEach(function(pic) {
      getPicItem(pic, picsContainer);
    });

    // Проверяем, есть ли пустое пространство между последней показанной строкой картинок
    // и если есть, значит экран большой и надо вывести ещё порцию картинок,
    if( isBottomReached() && isNextPageAvailable(pics, pageNumber, PAGE_SIZE)) {
      pageNumber++; // берём следующую страницу с картинками
      renderPics(pics, pageNumber, false);
    }
  };

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

    xhr.timeout = IMAGE_LOAD_TIMEOUT;

    // Таймаут или какая-то другая ошибка загрузки
    xhr.ontimeout = xhr.onerror = function() {
      picsContainer.classList.add('pictures-failure');
    };

    xhr.open('GET', URL_PICS_LOAD);
    xhr.send();
  };

  var setScrollEnabled = function() {
    var scrollTimeout;

    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function() {
        if (isBottomReached() && isNextPageAvailable(pictures, pageNumber, PAGE_SIZE)) {
          pageNumber++;
          renderPics(sortedPics, pageNumber, false);
        }
      }, 100);
    });
  };

  filterBlock.classList.add('hidden');

  getPics(function(loadedPics) {
    // Получаем изначальный массив картинок
    pictures = loadedPics;
    setSorter('popular');
    picsSortContainer.classList.remove('hidden');
    setSortingEnabled();
    setScrollEnabled();
  });

  filterBlock.classList.remove('hidden');
})();
