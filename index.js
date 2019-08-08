const fs    = require('fs');
const fetch = require('node-fetch');

const transforms = require('./transforms.js');
const formats    = require('./formats.js');
const platforms  = require('./platforms.js');

const { camelCase, kebabCase } = require('./util.js');

const figmaURL   = 'https://api.figma.com/v1/files/';


class Figmafy {
  constructor() {
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

  setFigmaId(id) {
    this.endpoint = figmaURL + id;

    return this;
  }

  setAccessToken(key) {
    this.accessToken = key || null;

    return this;
  }


  transformValue(value, type, name) {
    let val = value;

    this.platforms[this.buildPlatform].forEach((key) => {
      if (this.transforms[key].type === type && this.transforms[key].predicate(val)) {
        val = this.transforms[key].transform(val, name);
      }
    });

    return val;
  }


  parseTokens(pages) {
    const props = [];
    const self  = this;

    pages.forEach(page => {
      page.children.forEach(artboard => {
        if (artboard.name[0] === '_') return;

        artboard.children.forEach(group => {
          if (group.type !== 'GROUP') return;

          group.children.forEach(layer => {
            if (layer.name[0] !== '$') return;

            let token = {
              name: layer.name.substr(1),
              type: group.name,
              _value: layer.characters,
              category: artboard.name,

              get value() {
                return self.transformValue(this._value, this.type, this.name);
              }
            };

            props.push(token);
          });
        });
      })
    });

    return props;
  }

  async getTokens() {
    if (!this.accessToken) throw console.error('access token has not been set');
    if (!this.endpoint) throw console.error('figma ID has not been set');

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
