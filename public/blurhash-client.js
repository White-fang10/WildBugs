/**
 * BlurHash Engine & Progressive Image Loader
 * Decodes compact BlurHash strings into instant, silky-smooth placeholders
 * with hardware-accelerated fade transitions.
 */
(function(window) {
  'use strict';

  const digitCharacters = [
    "0","1","2","3","4","5","6","7","8","9",
    "A","B","C","D","E","F","G","H","I","J",
    "K","L","M","N","O","P","Q","R","S","T",
    "U","V","W","X","Y","Z","a","b","c","d",
    "e","f","g","h","i","j","k","l","m","n",
    "o","p","q","r","s","t","u","v","w","x",
    "y","z","#","$","%","*","+",",","-",".",
    ":",";","=","?","@","[","]","^","_","{",
    "|","}","~"
  ];

  function decode83(str) {
    let val = 0;
    for (let i = 0; i < str.length; i++) {
      const idx = digitCharacters.indexOf(str[i]);
      if (idx !== -1) val = val * 83 + idx;
    }
    return val;
  }

  function sRGBToLinear(val) {
    const v = val / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }

  function linearTosRGB(val) {
    const v = Math.max(0, Math.min(1, val));
    return v <= 0.0031308
      ? Math.trunc(v * 12.92 * 255 + 0.5)
      : Math.trunc((1.055 * Math.pow(v, 0.4166666666666667) - 0.055) * 255 + 0.5);
  }

  function signPow(val, exp) {
    return Math.sign(val) * Math.pow(Math.abs(val), exp);
  }

  function validate(blurhash) {
    if (!blurhash || typeof blurhash !== 'string' || blurhash.length < 6) return false;
    try {
      const sizeFlag = decode83(blurhash[0]);
      const numY = Math.floor(sizeFlag / 9) + 1;
      const numX = (sizeFlag % 9) + 1;
      return blurhash.length === 4 + 2 * numX * numY;
    } catch {
      return false;
    }
  }

  function decode(blurhash, width, height, punch = 1) {
    if (!validate(blurhash)) return null;

    const sizeFlag = decode83(blurhash[0]);
    const numY = Math.floor(sizeFlag / 9) + 1;
    const numX = (sizeFlag % 9) + 1;
    const quantisedMaxValue = decode83(blurhash[1]);
    const maxValue = ((quantisedMaxValue + 1) / 166) * punch;

    const colors = new Array(numX * numY);
    for (let i = 0; i < colors.length; i++) {
      if (i === 0) {
        const val = decode83(blurhash.substring(2, 6));
        colors[i] = [
          sRGBToLinear(val >> 16),
          sRGBToLinear((val >> 8) & 255),
          sRGBToLinear(val & 255)
        ];
      } else {
        const val = decode83(blurhash.substring(4 + i * 2, 6 + i * 2));
        colors[i] = [
          signPow((Math.floor(val / 361) - 9) / 9, 2) * maxValue,
          signPow(((Math.floor(val / 19) % 19) - 9) / 9, 2) * maxValue,
          signPow(((val % 19) - 9) / 9, 2) * maxValue
        ];
      }
    }

    const bytesPerRow = width * 4;
    const pixels = new Uint8ClampedArray(bytesPerRow * height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0;
        for (let j = 0; j < numY; j++) {
          for (let i = 0; i < numX; i++) {
            const basis = Math.cos((Math.PI * x * i) / width) * Math.cos((Math.PI * y * j) / height);
            const color = colors[i + j * numX];
            r += color[0] * basis;
            g += color[1] * basis;
            b += color[2] * basis;
          }
        }

        const offset = 4 * x + y * bytesPerRow;
        pixels[offset] = linearTosRGB(r);
        pixels[offset + 1] = linearTosRGB(g);
        pixels[offset + 2] = linearTosRGB(b);
        pixels[offset + 3] = 255;
      }
    }

    return pixels;
  }

  function renderToCanvas(blurhash, canvas, width = 32, height = 18) {
    if (!canvas) return false;
    const pixels = decode(blurhash, width, height);
    if (!pixels) return false;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    return true;
  }

  function createCanvas(blurhash, width = 32, height = 18, className = 'blurhash-canvas') {
    const canvas = document.createElement('canvas');
    canvas.className = className;
    renderToCanvas(blurhash, canvas, width, height);
    return canvas;
  }

  /**
   * Setup progressive blurhash placeholder on an <img> element
   */
  function attach(img, blurhash, options = {}) {
    if (!img || !blurhash) return;
    const width = options.width || 32;
    const height = options.height || 18;
    const className = options.className || 'blurhash-canvas';

    const parent = img.parentElement;
    if (!parent) return;

    let canvas = parent.querySelector(`.${className}`);
    if (!canvas) {
      canvas = createCanvas(blurhash, width, height, className);
      parent.insertBefore(canvas, img);
    } else {
      renderToCanvas(blurhash, canvas, width, height);
    }

    function markLoaded() {
      img.classList.add('blurhash-loaded');
      canvas.classList.add('blurhash-fade-out');
    }

    if (img.complete && img.naturalWidth > 0) {
      // Image already cached in memory
      requestAnimationFrame(markLoaded);
    } else {
      img.addEventListener('load', markLoaded, { once: true });
      img.addEventListener('error', function() {
        // Retain smooth blurhash placeholder when image is recovering or fallbacking
        canvas.classList.remove('blurhash-fade-out');
      });
    }
  }

  function initAuto() {
    const images = document.querySelectorAll('img[data-blurhash]');
    images.forEach(img => {
      const hash = img.getAttribute('data-blurhash');
      if (hash) attach(img, hash);
    });
  }

  window.BlurHash = {
    validate,
    decode,
    renderToCanvas,
    createCanvas,
    attach,
    initAuto
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuto);
  } else {
    initAuto();
  }
})(window);
