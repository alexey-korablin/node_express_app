module.exports = function (grunt) {
    ['grunt-cafe-mocha', 'grunt-contrib-jshint', 'grunt-exec']
        .forEach((task) => {
            grunt.loadNpmTasks(task);
        });

    grunt.initConfig({
        cafemocha: {
            all: { src: 'qa/test-*.js', options: { ui: 'tdd' } }
        },
        jshint: {
            options: {
                "esversion": 6
            },
            app: ['meadowlark.js', 'public/js/**/*.js', 'lib/**/*.js'],
            qa: ['gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js']
        },
        exec: {
            linkchecker: { cmd: 'linkchecker http://localhost:3053' }
        }
    });

    grunt.registerTask('default', ['cafemocha', 'jshint', 'exec']);
};