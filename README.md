# Figma-bridge
Tool to transform design tokens from Figma to any format for any platform

## Usage
### Designer side
Name all the layers, which you want to work as variables for developers, with '$' at the begining. After that group layers by categories: Typography, Colors, Shadows, Spacings — category will define what value we will get from layer (e.g. if it's a color category then we will get color from layer styles).
So, the name of the layer will become the name of variable and value of layer will become the variable value.

### Developer side
Install package first

```js
npm install figma-bridge
```

good, now just copy this example for now
```js
const figmaBridge   = require('figma-bridge');
const fb            = new figmaBridge();


fb
  .setFigmaId('OKfk1HeUOHEZjD7O7GfWku2W') // you can find it inside an URL of a Figma file
  .setAccessToken('14884-0800f174-9b25-4baf-9f0f-2ef8f00s920e') // you can get it in account settings in Figma
  .build([
    { platform: 'web:scss', dest: './tokens/web/' },
    { platform: 'ios:swift', dest: './tokens/ios/' },
    { platform: 'android:xml', dest: './tokens/android/' }
  ]);

```

Figmafy supports setting your own Formats and Transforms, I'll write about this later.

Hugely influenced by [Theo](https://www.npmjs.com/package/theo).