// Node.js polyfills for React Native
// This file must be imported at the very top of your app

import 'react-native-polyfill-globals/auto';
import 'react-native-get-random-values';

// Basic crypto polyfill
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues: (array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    subtle: {
      generateKey: () => Promise.resolve({}),
      sign: () => Promise.resolve(new ArrayBuffer(0)),
      verify: () => Promise.resolve(true),
      encrypt: () => Promise.resolve(new ArrayBuffer(0)),
      decrypt: () => Promise.resolve(new ArrayBuffer(0)),
    }
  };
}

// Basic zlib polyfill
if (typeof global.zlib === 'undefined') {
  global.zlib = {
    inflateRaw: (buffer, options, callback) => {
      if (typeof options === 'function') {
        callback = options;
      }
      if (callback) {
        callback(null, buffer);
      } else {
        return Promise.resolve(buffer);
      }
    },
    deflateRaw: (buffer, options, callback) => {
      if (typeof options === 'function') {
        callback = options;
      }
      if (callback) {
        callback(null, buffer);
      } else {
        return Promise.resolve(buffer);
      }
    }
  };
}

// Jose package has been removed to resolve crypto/zlib issues

// Basic polyfills are still available for other packages that might need them





console.log('🔧 Basic crypto/zlib polyfills loaded');
