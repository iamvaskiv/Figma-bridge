const { camelCase, kebabCase } = require('./util.js');


module.exports = {
  // web scss
  'web:scss': tokens => tokens.map(prop => `$${prop.name}: ${prop.value};`).join(`
`),
  // ios swift
  'ios:swift': tokens => `import UIKit

struct Styles {${tokens.map(prop => `
    static let ${camelCase(prop.name)} = ${prop.value}`).join('')}
}
`,
  //android xml
  'android:xml': tokens => `<?xml version="1.0" encoding="UTF-8"?>
<resources>
    ${tokens.map(prop => {
      switch (prop.type) {
        case 'color':
          return `<color name="${camelCase(prop.name)}">${prop.value}</color>`;
        case 'size':
          return `<dimen name="${camelCase(prop.name)}">${prop.value}</dimen>`;
        case 'string':
          return `<string name="${camelCase(prop.name)}">${prop.value}</string>`;
      }
    }).join(`
    `)}
</resources>`
}

