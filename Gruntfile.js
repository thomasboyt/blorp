module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    secret: grunt.file.readJSON('secret.json'),

    clean: {
      build: ['build/']
    },

    webpack: {
      main: require('./webpack.config'),
    },

    sftp: {
      options: {
        path: '<%= secret.path %>',
        host: '<%= secret.host %>',
        username: '<%= secret.username %>',
        agent: process.env.SSH_AUTH_SOCK,
        showProgress: true,
        srcBasePath: 'build/',
        createDirectories: true
      },

      game: {
        files: {
          './': ['build/**', '!build/assets/**']
        }
      },

      assets: {
        files: {
          './': ['build/assets/**']
        }
      }
    },

    copy: {
      index: {
        src: 'index.html',
        dest: 'build/index.html'
      }
    },

    zip: {
      itch: {
        cwd: 'build/',
        src: ['build/**/*'],
        dest: 'build/itch' + Date.now() + '.zip'
      }
    }
  });

  grunt.registerTask('dist', ['clean:build', 'webpack', 'copy:index']);

  grunt.registerTask('deploy:all', ['dist', 'sftp']);
  grunt.registerTask('deploy', ['dist', 'sftp:game']);

  grunt.registerTask('itch', ['dist', 'zip']);
};
