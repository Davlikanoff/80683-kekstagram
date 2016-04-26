/* global Resizer: true */

/**
 * @fileoverview
 * @author Igor Alexeenko (o0)
 */

'use strict';

var browserCookies = require('browser-cookies');

(function() {
  /** @enum {string} */
  var FileType = {
    'GIF': '',
    'JPEG': '',
    'PNG': '',
    'SVG+XML': ''
  };

  /** @enum {number} */
  var Action = {
    ERROR: 0,
    UPLOADING: 1,
    CUSTOM: 2
  };

  /**
   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
   * из ключей FileType.
   * @type {RegExp}
   */
  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

  /**
   * @type {Object.<string, string>}
   */
  var filterMap = {
    'none': 'filter-none',
    'chrome': 'filter-chrome',
    'sepia': 'filter-sepia'
  };

  /**
   * Объект, который занимается кадрированием изображения.
   * @type {Resizer}
   */
  var currentResizer;

  function cookiesLifeTime(month, date) {
    var currentDate = new Date();
    var currentMonth = currentDate.getMonth(currentDate) + 1;
    var currentDay = currentDate.getDate(currentDate);
    var lastBirthday = new Date(currentDate.getFullYear(), month - 1, date);
    var diff;

    //Если ДР ещё не наступило, то считаем разницу с прошлого года
    if ( (month > currentMonth) || (month === currentMonth && date > currentDay ) ) {
      lastBirthday.setFullYear(currentDate.getFullYear() - 1);
    }

    //Если ДР сегодня, то срок жизни куки 23:59:59, начиная с текущего времени
    if ( (month === currentMonth) && (date === currentDay) ) {
      diff = (23 * 3600 + 59 * 60 + 59) * 1000;
    } else {
      diff = currentDate - lastBirthday;
    }

    var result = new Date(+currentDate + diff).toUTCString();
    return result;
  }

  function setLastUsedFilter() {
    var radioBtns = filterForm['upload-filter'];

    // По умолчанию выбран первый фильтр, т.е. обычная фотка без фильтра
    radioBtns[0].checked = true;

    if (browserCookies.get('lastUsedFilter')) {
      for (var i = 0; i < radioBtns.length; i++) {
        if (radioBtns[i].value === browserCookies.get('lastUsedFilter')) {
          radioBtns[i].checked = true;
          filterImage.className = 'filter-image-preview ' + filterMap[radioBtns[i].value];
        } else {
          radioBtns[i].checked = false;
        }
      }
    }
  }

  /**
   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
   * изображением.
   */
  function cleanupResizer() {
    if (currentResizer) {
      currentResizer.remove();
      currentResizer = null;
    }
  }

  /**
   * Ставит одну из трех случайных картинок на фон формы загрузки.
   */
  function updateBackground() {
    var images = [
      'img/logo-background-1.jpg',
      'img/logo-background-2.jpg',
      'img/logo-background-3.jpg'
    ];

    var backgroundElement = document.querySelector('.upload');
    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
  }

  /**
   * Проверяет, валидны ли данные, в форме кадрирования.
   * @return {boolean}
   */
  function resizeFormIsValid() {
    var resizeX = parseInt(resizeFormResizeX.value, 10) || 0;
    var resizeY = parseInt(resizeFormResizeY.value, 10) || 0;
    var resizeSize = parseInt(resizeFormResizeSize.value, 10) || 0;
    var result = true;

    if ((resizeX + resizeSize) > currentResizer._image.naturalWidth) {
      result = false;
    }

    if ((resizeY + resizeSize) > currentResizer._image.naturalHeight) {
      result = false;
    }

    return result;
  }

  /**
   * Форма загрузки изображения.
   * @type {HTMLFormElement}
   */
  var uploadForm = document.forms['upload-select-image'];

  /**
   * Форма кадрирования изображения.
   * @type {HTMLFormElement}
   */
  var resizeForm = document.forms['upload-resize'];

  /**
   * Форма добавления фильтра.
   * @type {HTMLFormElement}
   */
  var filterForm = document.forms['upload-filter'];

  var resizeFormResizeX = resizeForm['x'];
  var resizeFormResizeY = resizeForm['y'];
  var resizeFormResizeSize = resizeForm['size'];
  var resizeFormSubmitBtn = resizeForm['fwd'];
  var maxAvailableSize;

  /**
   * @type {HTMLImageElement}
   */
  var filterImage = filterForm.querySelector('.filter-image-preview');

  /**
   * @type {HTMLElement}
   */
  var uploadMessage = document.querySelector('.upload-message');

  /**
   * @param {Action} action
   * @param {string=} message
   * @return {Element}
   */
  function showMessage(action, message) {
    var isError = false;

    switch (action) {
      case Action.UPLOADING:
        message = message || 'Кексограмим&hellip;';
        break;

      case Action.ERROR:
        isError = true;
        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
        break;
    }

    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
    uploadMessage.classList.remove('invisible');
    uploadMessage.classList.toggle('upload-message-error', isError);
    return uploadMessage;
  }

  function hideMessage() {
    uploadMessage.classList.add('invisible');
  }

  // Проверяем валидна ли наша форма и если нет,
  // то делаем кнопку "Вперед"(стрелка вправо) недоступной
  function setSubmitBtnEnabled() {
    resizeFormSubmitBtn.disabled = !resizeFormIsValid();
  }

  /**
   * Обработчик изменения изображения в форме загрузки. Если загруженный
   * файл является изображением, считывается исходник картинки, создается
   * Resizer с загруженной картинкой, добавляется в форму кадрирования
   * и показывается форма кадрирования.
   * @param {Event} evt
   */
  uploadForm.addEventListener('change', function(evt) {
    var element = evt.target;
    if (element.id === 'upload-file') {
      // Проверка типа загружаемого файла, тип должен быть изображением
      // одного из форматов: JPEG, PNG, GIF или SVG.
      if (fileRegExp.test(element.files[0].type)) {
        var fileReader = new FileReader();

        showMessage(Action.UPLOADING);

        fileReader.onload = function() {
          cleanupResizer();

          currentResizer = new Resizer(fileReader.result);
          currentResizer.setElement(resizeForm);
          uploadMessage.classList.add('invisible');

          uploadForm.classList.add('invisible');
          resizeForm.classList.remove('invisible');

          /**
            Выставляем в поле "Сторона" минимальную сторону изображения
          */
          if (currentResizer._image.naturalWidth >= currentResizer._image.naturalHeight) {
            maxAvailableSize = currentResizer._image.naturalHeight;
          } else {
            maxAvailableSize = currentResizer._image.naturalWidth;
          }
          resizeFormResizeSize.max = maxAvailableSize;
          resizeFormResizeSize.value = maxAvailableSize;

          hideMessage();
        };

        fileReader.readAsDataURL(element.files[0]);
      } else {
        // Показ сообщения об ошибке, если загружаемый файл, не является
        // поддерживаемым изображением.
        showMessage(Action.ERROR);
      }
    }
  });

  /**
   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
   * и обновляет фон.
   * @param {Event} evt
   */
  resizeForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    cleanupResizer();
    updateBackground();

    resizeForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
   * кропнутое изображение в форму добавления фильтра и показывает ее.
   * @param {Event} evt
   */
  resizeForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    if (resizeFormIsValid()) {
      filterImage.src = currentResizer.exportImage().src;

      resizeForm.classList.add('invisible');
      filterForm.classList.remove('invisible');
    }
  });

  /**
   * Сброс формы фильтра. Показывает форму кадрирования.
   * @param {Event} evt
   */
  filterForm.addEventListener('reset', function(evt) {
    evt.preventDefault();

    filterForm.classList.add('invisible');
    resizeForm.classList.remove('invisible');
  });

  /**
   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
   * записав сохраненный фильтр в cookie.
   * @param {Event} evt
   */
  filterForm.addEventListener('submit', function(evt) {
    evt.preventDefault();

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    browserCookies.set('lastUsedFilter', selectedFilter, cookiesLifeTime(1, 3));

    cleanupResizer();
    updateBackground();

    filterForm.classList.add('invisible');
    uploadForm.classList.remove('invisible');
  });

  /**
   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
   * выбранному значению в форме.
   */
  filterForm.addEventListener('change', function() {

    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
      return item.checked;
    })[0].value;

    // Класс перезаписывается, а не обновляется через classList потому что нужно
    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
    // состояние или просто перезаписывать.
    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
  });

  window.addEventListener('resizerchange', function() {
    var resizerData = currentResizer.getConstraint();

    resizeFormResizeX.value = resizerData.x;
    resizeFormResizeY.value = resizerData.y;
    resizeFormResizeSize.value = resizerData.side;

    setSubmitBtnEnabled();
  });

  resizeForm.addEventListener('change', function() {
    currentResizer.setConstraint(+resizeFormResizeX.value, +resizeFormResizeY.value, +resizeFormResizeSize.value);
  });

  cleanupResizer();
  updateBackground();
  setLastUsedFilter();
})();
