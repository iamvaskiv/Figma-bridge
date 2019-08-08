const { camelCase } = require('./util.js');


module.exports = {
  // web scss
  'scss': tokens => tokens.map(prop => `$${prop.name}: ${prop.value};`).join(`
`),
  // ios swift
  'ios': tokens => `import UIKit

struct Styles {${tokens.map(prop => `
    static let ${camelCase(prop.name)} = ${prop.value}`).join('')}
}
`,
  //android xml
  'android': tokens => `<?xml version="1.0" encoding="UTF-8"?>
<resources>
    ${tokens.map(prop => prop.value).join(`
    `)}
</resources>`
}

