"use strict";

var committers  = require('./committers');
var githubAPI   = require('./githubLoader');
var q           = require('q');
var sprintf     = require('sprintf-js').sprintf;
var END_POINT   = '/repos/%s/%s/contributors';

/**
 * Service:  GitHub API Contributor
 */
module.exports = function $contributors(options) {

  var sortStrategy   = function (a,b) { return options.sortStrategy(a, b, options); };
  var filterStrategy = function (u)   { return options.filterStrategy(u, options);  };
  var layoutStrategy = function (u)   { return options.layoutStrategy(options)(u);  };

  // Publish $contributor service API

  return {
    loadAll: function (owner, repository, authToken, since) {
      return q.Promise((resolve, reject) =>{
        // Load list of commiters; each with a count of total # of commits
        committers(options)
            .loadSince( owner, repository, authToken, since )
            .then( buildContributorTable )
            .then( resolve, reject );

        /**
         * Apply the strategies to build the output table of Contributors
         */
        function buildContributorTable(contributors) {
          return layoutStrategy(
            contributors
              .filter( filterStrategy )
              .sort( sortStrategy )
          );
        }
      });
    }
  };

};