export const successAsync = (res, delay = 1) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(res);
    }, delay);
  });
};

export const failureAsync = (res, delay = 1) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(res));
    }, delay);
  });
};
