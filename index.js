const fs    = require('fs');
const fetch = require('node-fetch');

const transforms = require('./transforms.js');
const formats    = require('./formats.js');
const platforms  = require('./platforms.js');

const { camelCase, kebabCase, tinycolor } = require('./util.js');

const figmaURL   = 'https://api.figma.com/v1/files/';


class Figmafy {
  constructor() {
    this.basicTokens   = false;
    this.endpoint      = null;
    this.accessToken   = null;
    this.tokens        = null;
    this.buildPlatform = null;
    this.transforms    = transforms || null;
    this.formats       = formats || null;
    this.platforms     = platforms || null;
  }

  static camelCase(str) {
    return camelCase(str);
  }

  static kebabCase(str) {
    return kebabCase(str);
  }

  static tinycolor(str) {
    return tinycolor(str);
  }

  useBasicTokens() {
    this.basicTokens = true;

    return this;
  }

  setFigmaId(id) {
    this.endpoint = figmaURL + id;

    return this;
  }

  setAccessToken(key) {
    this.accessToken = key || null;

    return this;
  }


  transformValue(value, type, name, category) {
    let val = value;
    
    this.platforms[this.buildPlatform][category].forEach((key) => {
      if (this.transforms[key].type === type && this.transforms[key].predicate(value)) {
        val = this.transforms[key].transform(val, name);
      }
    });

    return val;
  }

  getShadowToken(template, layer) {
    const val = layer.effects.map((effect) => {
      if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
        const inner = effect.type === 'INNER_SHADOW';
        const { r, g, b, a } = effect.color;
        const color = tinycolor({r, g, b, a});

        return `${inner ? 'inset ' : ''}${effect.offset.x} ${effect.offset.y} ${effect.radius}px ${color}`;
      }

    });

    return [Object.assign(template, {type: 'shadow', _value: val})];
  }

  getSpacingToken(template, layer) {
    const val = `${layer.absoluteBoundingBox.height}px`;
    
    return [Object.assign(template, {type: 'size', _value:  val})];
  }


  getColorToken(template, layer) {
    const { r, g, b, a } = layer.fills[0].color;
    const _value = tinycolor({r: r * 255, g: g * 255, b: b * 255, a: a * 255}).toHexString();

    return [Object.assign(template, {type: 'color', _value: _value})];
  }

  getFontToken(temp, layer) {
    const self = this;
    const style = layer.style;

    const family = {
      name: `${layer.name.replace('$', '')}-font-family`,
      type: 'string',
      _value: style.fontFamily,
      category: temp.category,

      get value() {
        return self.transformValue(this._value, this.type, this.name, this.category);
      }
    };

    const size = {
      name: `${layer.name.replace('$', '')}-font-size`,
      type: 'size',
      _value: `${style.fontSize}px`,
      category: temp.category,

      get value() {
        return self.transformValue(this._value, this.type, this.name, this.category);
      }
    };

    const weight = {
      name: `${layer.name.replace('$', '')}-font-weight`,
      type: 'size',
      _value: style.fontWeight,
      category: temp.category,

      get value() {
        return self.transformValue(this._value, this.type, this.name, this.category);
      }
    };

    const lineHeight = {
      name: `${layer.name.replace('$', '')}-line-height`,
      type: 'size',
      _value: `${style.lineHeightPx}px`,
      category: temp.category,

      get value() {
        return self.transformValue(this._value, this.type, this.name, this.category);
      }
    };

    const spacing = {
      name: `${layer.name.replace('$', '')}-letter-spacing`,
      type: style.letterSpacing !== 0 ? 'size' : 'string',
      _value: style.letterSpacing !== 0 ? `${style.lineHeightPx}px` : 'normal',
      category: temp.category,

      get value() {
        return self.transformValue(this._value, this.type, this.name, this.category);
      }
    };
    
    return [family, size, weight, lineHeight, spacing];
  }

  formatToken(layer, category) {
    const self = this;
    let tokens = [];

    const defaultToken = {
      name: layer.name.replace('$', ''),
      type: null,
      _value: layer.characters,
      category: category,

      get value() {
        return self.transformValue(this._value, this.type, this.name, this.category);
      }
    };

    if (this.basicTokens) {
      return [defaultToken];
    }

    switch (category) {

      case 'Colors':
        this.getColorToken(defaultToken, layer).forEach(token => {
          tokens.push(token);
        });
        break;

      case 'Typography':
        this.getFontToken(defaultToken, layer).forEach(token => {
          tokens.push(token);
        });
        break;

      case 'Spacings': 
        this.getSpacingToken(defaultToken, layer).forEach(token => {
          tokens.push(token);
        });
        break;

      case 'Shadows': 
        this.getShadowToken(defaultToken, layer).forEach(token => {
          tokens.push(token);
        });
        break;
    
      default:
        tokens.push(defaultToken);
    }


    return tokens;
  }


  parseTokens(pages) {
    const props = [];

    pages.forEach(page => {
      page.children.forEach(artboard => {
        if (artboard.name[0] === '_') return;

        artboard.children.forEach(group => {
          if (group.type !== 'GROUP') return;

          group.children.forEach(layer => {
            if (layer.name[0] !== '$') return;

            this.formatToken(layer, group.name).forEach(token => {
              props.push(token);
            });
          });
        });
      })
    });

    return props;
  }

  async getTokens() {
    if (!this.accessToken) throw new Error('access token has not been set');
    if (!this.endpoint) throw new Error('figma ID has not been set');

    const result = await fetch(this.endpoint, {
      method: "GET",
      headers: {
        "X-Figma-Token": this.accessToken
      }
    });

    const figmaTreeStructure = await result.json();
    const designTokens = this.parseTokens(figmaTreeStructure.document.children);

    this.tokens = designTokens;
    return designTokens;
  }

  async build(arr) {
    const self = this;

    if (this.tokens === null) {
      console.log('loading raw design tokens...');
      await this.getTokens();
      console.log('tokens loaded');
    }


    arr.forEach((item) => {
      this.buildPlatform = item.platform;
      const platform     = this.formats[this.buildPlatform];

      if (!platform) throw console.log(`There is no such platform as ${this.buildPlatform}`);

      console.log(`transforming raw design tokens for ${item.platform}...`);
      const designTokens = platform(this.tokens);
      console.log('design tokens has been transformed');
      console.log('writing...');

      fs.writeFile(item.dest, designTokens, err => {
        if (err) console.log('Error writing file', err)
      });

      console.log('done');
    });
  }

  defineTransform(name, obj) {
    this.trasforms[name] = obj;

    return this;
  }

  defineFormat(name, func) {
    this.formats[name] = func;

    return this;
  }

  definePlatform(name, arr) {
    this.platforms[name] = arr;

    return this;
  }
}

module.exports = Figmafy;
