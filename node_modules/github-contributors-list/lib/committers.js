"use strict";

var githubAPI   = require('./githubLoader');
var q           = require('q'),
    sprintf     = require('sprintf-js').sprintf,
    END_POINT   = '/repos/%s/%s/commits?since=%sT00:00:00';


/**
 * Service:  GitHub API Commits
 */
module.exports = function $committers(options) {

  // Publish $committers service API

  return {
    loadSince: function (owner, repository, authToken, since) {
      var path    = sprintf( END_POINT, owner, repository, since || "" );
      var headers = authToken ? { 'Authorization' : sprintf('token %s', authToken) } : null;

      if ( !!options.sha ) path += sprintf( '&sha=%s', options.sha );

      return q.Promise(function (resolve, reject) {
        if ( hasFromDate(since) ) {

          githubAPI(options)
            .loadFrom(path, headers)
            .then(function (result) {
              resolve( calculateSummaries(result) );

            }, reject);
        }

        /**
         * Trying to load ALL commits can easily be too large;
         * a 'since' date is required...
         */
        function hasFromDate( since ) {
            if ( !since ) resolve(null);    // No committers available
            return !!since;
          }
      });

      /**
       * Get summary listing of all committer login names
       * and their associated # of commits
       */
      function calculateSummaries(result) {
          var summaries = result.reduce( function (summary, commit){
              if ( commit.author ) {
                  if ( summary[ commit.author.login ] ) {
                       var count = summary[ commit.author.login ].contributions || 0;
                       summary[ commit.author.login ].contributions = count + 1;
                  } else {
                      summary[ commit.author.login ] = commit.author;
                      summary[ commit.author.login ].contributions = 1;
                  }
                  return summary;
              }

              // Skip users without a login. In future try to use commit.commit.author.name.
              return summary;
          }, { });

          return Object.keys( summaries ).map( function (key) { return summaries[key]; });
      }
    }
  };

};