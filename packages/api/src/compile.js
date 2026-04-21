// SPDX-License-Identifier: MIT
import { compiler } from './compiler.js';
export async function compile({ auth, authToken, code, data, config }) {
  if (!code || !data) {
    throw new Error('Missing required parameters: code and data');
  }
  return await new Promise((resolve, reject) =>
    compiler.compile(code, data, config, (err, data) => {
      if (err && err.length) {
        resolve({errors: err});
      } else {
        resolve(data);
      }
    })
  );
}
