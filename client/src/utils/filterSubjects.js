const excludedSubjectsFromOL = [
  "New York Times bestseller",
  "New York Times Bestseller",
  "New York Times reviewed",
  "Accessible book",
  "Condensed books",
  "Magia",
  "Nestlé Smarties Book Prize winner",
  "Spanish language materials",
  "Open Library Staff Picks",
  "Long Now Manual for Civilization",
  "Protected DAISY",
  "Ficcion",
  "Chang pian xiao shuo",
  "Er tong du wu",
  "Ying yu",
  "Roman pour la jeunesse",
  "Cliffs Notes",
  "Littérature anglaise",
  "Fantasy fiction",
  "Children's fiction",
  "Fiction in English",
  "Large type books",
  "Novela",
  "Classics",
  "fiction",
];

const excludedPrefixesFromOL = ["Reading", "Translations", "Ficción", "English"];

export const filterSubjectsFromOL = (subjects) => {
  return subjects.filter((s) => {
    if (excludedSubjectsFromOL.includes(s)) return false;
    if (excludedPrefixesFromOL.includes(s.split(" ")?.[0])) return false;
    for (let i = 0; i < s.length; i++) {
      const c = s.charAt(i);
      if (c === ":" || c === "(" || c === ")" || c === "/" || c === "," || c === "&") return false;
    }
    return true;
  });
};

const excludedSubjectsOnSearch = ["Fiction", "Juvenile fiction", "Historical Fiction", "Classic Literature"];

export const filterSubjectsOnSearch = (subjects) => {
  return subjects.filter((s) => {
    return !excludedSubjectsOnSearch.includes(s);
  });
};
