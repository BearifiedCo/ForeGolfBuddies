// Node.js polyfills for React Native
// This file must be imported at the very top of your app

import 'react-native-get-random-values';

// Basic crypto polyfill
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues: (array: Uint8Array) => {
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
    } as SubtleCrypto,
  } as Crypto;
}

console.log('🔧 Crypto polyfills loaded');
