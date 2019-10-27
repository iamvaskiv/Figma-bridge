const tinycolor = require('tinycolor2');


module.exports = {
  'string/string': {
    type: 'string',
    predicate: () => true,
    transform: value => `"${value}"`
  },
  'CGFloat:rem/points': {
    type: 'size',
    predicate: value => /rem/.test(value),
    transform: value => `CGFloat(${value.replace('rem', '')*16})`
  },
  'CGFloat:px/points': {
    type: 'size',
    predicate: value => /px/.test(value),
    transform: value => `CGFloat(${value.replace('px', '')})`
  },
  'CGFloat:digits/points': {
    type: 'size',
    predicate: value => /^\d+$/.test(value),
    transform: value => `CGFloat(${value})`
  },
  'CGFloat:percentage/float': {
    type: 'size',
    predicate: value => /%/.test(value),
    transform: value => `CGFloat(${parseFloat(value.replace('%', '')/100)})`
  },
  'UIColor:hex/rgba': {
    type: 'color',
    predicate: value => tinycolor(value).isValid() && tinycolor(value).getFormat() == 'hex',
    transform: value => {
      const { r, g, b, a } = tinycolor(value).toRgb();
      return `UIColor(red: ${r/255}, green: ${g/255}, blue: ${b/255}, alpha: ${a})`;
    }
  },
  'XML:hex/hex8string': {
    type: 'color',
    predicate: value => tinycolor(value).isValid() && tinycolor(value).getFormat() == 'hex',
    transform: value => `#${tinycolor(value).toHex8().substr(6) + tinycolor(value).toHex8().substr(0, 6)}`
  },
  'XML:rem/dp': {
    type: 'size',
    predicate: value => /rem/.test(value),
    transform: value => `${value.replace('rem', '')*16}dp`
  },
  'XML:rem/sp': {
    type: 'size',
    predicate: value => /rem/.test(value),
    transform: value => `${value.replace('rem', '')*16}sp`
  },
  'XML:px/dp': {
    type: 'size',
    predicate: value => /px/.test(value),
    transform: value => `${value.replace('px', '')}dp`
  },
  'XML:px/sp': {
    type: 'size',
    predicate: (value, fontSize) => /px/.test(value) && !fontSize,
    transform: value => `${value.replace('px', '')}sp`
  },
  'XML:percentage/float-dp': {
    type: 'size',
    predicate: value => /%/.test(value),
    transform: value => `${parseFloat(value.replace('%', '')/100)}dp`
  },
  'XML:digits/digits': {
    type: 'size',
    predicate: value => /^\d+$/.test(value),
    transform: value => value
  },
  'XML:px/em(letterspacing)': {
    type: 'size',
    predicate: (value, fontSize) => !!fontSize && /px/.test(value),
    transform: (value, name, fontSize) => `${value.replace('px', '')/fontSize}`
  }
}