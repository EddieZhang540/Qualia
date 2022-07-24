export const formatLabel = (str, maxChar) => {
  let formatted = [];
  const words = str.split(" ");
  let temp = "";

  words.forEach((item, index) => {
    if (temp.length > 0) {
      let concat = temp + " " + item;

      if (concat.length > maxChar) {
        formatted.push(temp);
        temp = "";
      } else {
        if (index === words.length - 1) {
          formatted.push(concat);
          return;
        } else {
          temp = concat;
          return;
        }
      }
    }

    if (index === words.length - 1) {
      formatted.push(item);
      return;
    }

    if (item.length < maxChar) {
      temp = item;
    } else {
      formatted.push(item);
    }
  });

  return formatted;
};
