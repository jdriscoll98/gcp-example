(function (e) {
  const n = (e['af'] = e['af'] || {});
  n.dictionary = Object.assign(n.dictionary || {}, {
    '%0 of %1': '%0 van %1',
    'Block quote': 'Verwysingsaanhaling',
    Bold: 'Vet',
    Cancel: 'Kanselleer',
    Italic: 'Kursief',
    Save: 'Stoor',
    'Show more items': 'Wys meer items',
  });
  n.getPluralForm = function (e) {
    return e != 1;
  };
})(window.CKEDITOR_TRANSLATIONS || (window.CKEDITOR_TRANSLATIONS = {}));
