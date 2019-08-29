module.exports = {
  'web:scss': {
    'Typography': [],
    'Colors': [],
    'Shadows':  [],
    'Spacings': []
  },
  'ios:swift': {
    'Typography': ['CGFloat:rem/points', 'CGFloat:px/points', 'CGFloat:digits/points', 'CGFloat:percentage/float', 'string/string'],
    'Colors': ['UIColor:hex/rgba'],
    'Shadows': [],
    'Spacings': []
  },
  'android:xml': {
    'Typography': ['XML:rem/sp', 'XML:px/sp', 'XML:percentage/float-dp', 'XML:digits/digits', 'string/string'],
    'Colors': ['XML:hex/hex8string'],
    'Shadows': [],
    'Spacings': []
  }
}
