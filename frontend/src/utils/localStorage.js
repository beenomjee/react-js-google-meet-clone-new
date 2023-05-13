export const setLocalStorage = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const removeLocalStorage = (key) => {
  window.localStorage.removeItem(key);
};

export const getLocalStorage = (key) => {
  if (window.localStorage.getItem(key)) {
    return JSON.parse(window.localStorage.getItem(key));
  }
  return undefined;
};
