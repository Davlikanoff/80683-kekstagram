'use strict';

function getMessage(a, b) {

  var result;

  // проверка на GIF
  if (typeof (a) === 'boolean') {
	  if (a) {
			result = "Переданное GIF-изображение анимировано и содержит " + b + " кадров";
		} else {
			result = "Переданное GIF-изображение не анимировано";
		}
	}
	// проверка на SVG
  else if (typeof(a) == "number") {
		result = "Переданное SVG-изображение содержит " + a + " объектов и " + (b * 4) + " атрибутов";
	}
	else if (Array.isArray(a)) {
	// проверка на JPG
		if (Array.isArray(b)) {
			var square = 0;

			for (var i = 0; i <= (a.length - 1); i++) {
				square = square + a[i] * b[i];
			};

			result = "Общая площадь артефактов сжатия: " + square + " пикселей";
		}
	// проверка на PNG
		else {
			var sum = 0;

			for (var i = 0; i <= (a.length - 1); i++) {
				sum = sum + a[i];
			};

			result = "Количество красных точек во всех строчках изображения: " + sum;
		}
	}

	return result;
}
