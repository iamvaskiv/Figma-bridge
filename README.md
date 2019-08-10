# Figmafy
Tool to transform design tokens from Figma to any format for any platform

## Usage
### Designer side
Name all the text layers, which you want to work as variables for developers, with '$' at the begining.
So, the name of the text layer will become the name of variable and value of layer will become the variable value.

### Developer side
Install package first

```js
npm install figmafy
```

good, now just copy this example
```js
const Figmafy   = require('figmafy');
const fy        = new Figmafy();

// don't forget to change destinations
const webDest   = './styles.scss'; 
const iosDest   = './styles.swift';
const droidDest = './styles.xml';


fy
  .setFigmaId('OKfk1HeUOHEZjD7O7GfWku2W') // you can find it inside an URL of a Figma file
  .setAccessToken('14884-0800f174-9b25-4baf-9f0f-2ef8f00s920e') // you can get it in account settings in Figma
  .build([
    { platform: 'web:scss', dest: webDest },
    { platform: 'ios:swift', dest: iosDest },
    { platform: 'android:xml', dest: droidDest }
  ]);

```

Figmafy supports setting your own Formats and Transforms, I'll write about this later.

Hugely influenced by [Theo](https://www.npmjs.com/package/theo).