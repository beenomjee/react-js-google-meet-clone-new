const genUniqueId = () => {
  console.log("Creating unique id");
  const str = Date.now().toString().split("");
  let uniqueId = "";
  for (const num of str) {
    uniqueId += String.fromCharCode(parseInt(num) + 97);
  }

  return uniqueId;
};

export default genUniqueId;
