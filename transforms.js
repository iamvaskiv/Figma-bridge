const tinycolor = require('tinycolor2');
const camelCase = require('lodash.camelcase');

module.exports = {
  'string:string': {
    type: 'string',
    predicate: () => true,
    transform: value => `"${value}"`
  },
  'rem:points/CGFloat': {
    type: 'size',
    predicate: value => value.includes('rem'),
    transform: value => `CGFloat(${value.replace('rem', '')*16})`
  },
  'px:points/CGFloat': {
    type: 'size',
    predicate: value => value.includes('px'),
    transform: value => `CGFloat(${value.replace('px', '')})`
  },
  'digits:points/CGFloat': {
    type: 'size',
    predicate: value => /^\d+$/.test(value),
    transform: value => `CGFloat(${value})`
  },
  'percentage:float/CGFloat': {
    type: 'size',
    predicate: value => /%/.test(value),
    transform: value => `CGFloat(${parseFloat(value.replace('%', '')/100)})`
  },
  'hex:rgba/UIColor': {
    type: 'color',
    predicate: value => tinycolor(value).isValid() && tinycolor(value).getFormat() == 'hex',
    transform: value => {
      const { r, g, b, a } = tinycolor(value).toRgb();
      return `UIColor(red: ${r/255}, green: ${g/255}, blue: ${b/255}, alpha: ${a})`;
    }
  },
  'hex:hex8string/XML': {
    type: 'color',
    predicate: value => tinycolor(value).isValid() && tinycolor(value).getFormat() == 'hex',
    transform: (value, name) => `<color name="${camelCase(name)}">${tinycolor(value).toHex8String()}</color>`
  },
  'XML:rem/dp': {
    type: 'size',
    predicate: value => value.includes('rem'),
    transform: (value, name) => `<dimen name="${camelCase(name)}">${value.replace('rem', '')*16}dp</dimen>`
  },
  'XML:px/dp': { // TODO: add sp
    type: 'size',
    predicate: value => value.includes('px'),
    transform: (value, name) => `<dimen name="${camelCase(name)}">${value.replace('px', '')}dp</dimen>`
  },
  'XML:percentage/float-dp': {
    type: 'size',
    predicate: value => /%/.test(value),
    transform: (value, name) => `<dimen name="${camelCase(name)}">${parseFloat(value.replace('%', '')/100)}dp</dimen>`
  },
  'XML:digits/digits': {
    type: 'size',
    predicate: value => /^\d+$/.test(value),
    transform: (value, name) => `<dimen name="${camelCase(name)}">${value}</dimen>`
  },
  'XML:string/string': {
    type: 'string',
    predicate: () => true,
    transform: (value, name) => `<string name="${camelCase(name)}">${value}</string>`
  }
}