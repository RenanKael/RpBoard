export const THEMES = {
  light: {
    appBackground: '#f5f5f7',
    surface: '#fff',
    border: '#e5e4e7',
    text: '#202126',
    mutedText: '#777983',
    icon: '#45464c',
    disabled: '#c7c7cc',
    activeBackground: '#ebefff',
    activeText: '#2947d7',
    grid: '#b0b3ba',
    hint: '#6f7078',
    controlBackground: '#fff',
  },
  dark: {
    appBackground: '#17191f',
    surface: '#24272f',
    border: '#393d47',
    text: '#f4f5f7',
    mutedText: '#a7abb6',
    icon: '#d5d8df',
    disabled: '#666b78',
    activeBackground: '#29345f',
    activeText: '#9eafff',
    grid: '#424754',
    hint: '#a7abb6',
    controlBackground: '#24272f',
  },
};

export function getTheme(darkMode) {
  return darkMode ? THEMES.dark : THEMES.light;
}
