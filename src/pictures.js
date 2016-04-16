'use strict';

(function() {
  var filterBlock = document.forms['upload-filter'];
  filterBlock.classList.add('hidden');

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

  window.pictures.forEach(function(pic) {
    getPicItem(pic, picsContainer);
  });

  filterBlock.classList.remove('hidden');
})();
