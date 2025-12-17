const config = {
  singleQuote: true, // Use single quotes instead of double quotes
  trailingComma: 'all', // Add trailing commas wherever possible
  printWidth: 100, // Specify the line length that the printer will wrap on
  proseWrap: 'always', // 根据 printWidth 决定是否换行
  endOfLine: 'auto', // Prettier 不改变文件原有的行结尾换行符。你是什么格式，它就继续用什么格式。
  semi: true, // 在语句末尾打印分号
  tabWidth: 2, // 每个缩进级别的空格数
  htmlWhitespaceSensitivity: 'strict', // 对 HTML 全部空格敏感
};
export default config;
