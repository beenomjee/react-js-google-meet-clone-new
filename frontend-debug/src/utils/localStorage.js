export const setLocalStorage = (key, value) => {
  console.log("Set local storage");
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const removeLocalStorage = (key) => {
  console.log("Remove from local storage");
  window.localStorage.removeItem(key);
};

export const getLocalStorage = (key) => {
  console.log("Get from local storage");
  if (window.localStorage.getItem(key)) {
    return JSON.parse(window.localStorage.getItem(key));
  }
  return undefined;
};
