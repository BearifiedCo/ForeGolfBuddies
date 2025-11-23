// Node.js polyfills for React Native
// This file must be imported at the very top of your app

import 'react-native-polyfill-globals/auto';
import 'react-native-get-random-values';

// Basic crypto polyfill
if (typeof (globalThis as any).crypto === 'undefined') {
  (globalThis as any).crypto = {
    getRandomValues: (array: Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array) => {
      if (!array) return array;
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    subtle: {
      generateKey: () => Promise.resolve({ publicKey: {}, privateKey: {} } as unknown as CryptoKeyPair),
      sign: () => Promise.resolve(new ArrayBuffer(0)),
      verify: () => Promise.resolve(true),
      encrypt: () => Promise.resolve(new ArrayBuffer(0)),
      decrypt: () => Promise.resolve(new ArrayBuffer(0)),
    }
  };
}

// Basic zlib polyfill
if (typeof (globalThis as any).zlib === 'undefined') {
  (globalThis as any).zlib = {
    inflateRaw: (buffer: any, options: any, callback: any) => {
      if (typeof options === 'function') {
        callback = options;
      }
      if (callback) {
        callback(null, buffer);
      } else {
        return Promise.resolve(buffer);
      }
    },
    deflateRaw: (buffer: any, options: any, callback: any) => {
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

console.log('🔧 Basic crypto/zlib polyfills loaded');
