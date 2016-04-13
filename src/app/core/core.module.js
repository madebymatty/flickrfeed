(function() {
    'use strict';

    angular.module('app.core', [
        /*
         * Angular modules
         */
        'ngAnimate', 'ngRoute', 'ngSanitize', 'angulike',
        /*
         * Our reusable cross app code modules
         */
        'blocks.exception', 'blocks.logger', 'blocks.router'

    ]);
})();
