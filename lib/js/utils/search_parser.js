(function() {

var $ = jQuery; // Handle namespaced jQuery

VS.app.SearchParser = {

  // Called to parse a query into a collection of `SearchFacet` models.
  parse : function(instance, query) {
    var searchFacets = this._extractAllFacetsWithGrammerParser(instance, query);
    instance.searchQuery.reset(searchFacets);
    return searchFacets;
  },

  // uses a grammar-based parser for the query-notation: 'Category: label(value)'
  _extractAllFacetsWithGrammerParser : function(instance, query) {
    var parsedQuery = VS.app.GrammarParser.parse(query),
        facets = $.map(parsedQuery, function(fparams) {
      return new VS.model.SearchFacet({
          category  : fparams.category,
          label     : VS.utils.inflector.trim(fparams.label || fparams.value),
          value     : fparams.value,
          app       : instance
        })
    })
    return facets;
  },

  // Walks the query and extracts facets, categories, and free text.
  _extractAllFacets : function(instance, query) {
    var facets = [];
    var originalQuery = query;
    while (query) {
      var category, value;
      originalQuery = query;
      var field = this._extractNextField(query);
      if (!field) {
        category = instance.options.remainder;
        value    = this._extractSearchText(query);
        query    = VS.utils.inflector.trim(query.replace(value, ''));
      } else if (field.indexOf(':') != -1) {
        category = field.match(this.CATEGORY)[1].replace(/(^['"]|['"]$)/g, '');
        value    = field.replace(this.CATEGORY, '').replace(/(^['"]|['"]$)/g, '');
        query    = VS.utils.inflector.trim(query.replace(field, ''));
      } else if (field.indexOf(':') == -1) {
        category = instance.options.remainder;
        value    = field;
        query    = VS.utils.inflector.trim(query.replace(value, ''));
      }
      if (category && value) {
          var searchFacet = new VS.model.SearchFacet({
            category : category,
            value    : VS.utils.inflector.trim(value),
            app      : instance
          });
          facets.push(searchFacet);
      }
      if (originalQuery == query) break;
    }
    return facets;
  }

};

})();
