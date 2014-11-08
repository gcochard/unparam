module.exports = function(grunt) {
    'use strict';
    grunt.initConfig({
        githubPages: {
          target: {
            options: {
              // The default commit message for the gh-pages branch
              commitMessage: 'push'
            },
            // The folder where your gh-pages repo is
            src: 'gh-pages'
          }
        },
        jsdoc : {
          dist : {
            src: ["app.js","lib/unparam.js","README.md"],
            options: {
              destination: 'gh-pages/jsdoc'
            }
          }
        }
    });

    // create an alias for the githubPages task
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-github-pages');
    grunt.registerTask('deploy', ['githubPages:target']);
};
