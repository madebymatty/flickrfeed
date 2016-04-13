(function() {
    'use strict';

    var core = angular.module('app.core');

    core.config(toastrConfig);

    /* @ngInject */
    function toastrConfig(toastr) {
        toastr.options.timeOut = 4000;
        toastr.options.positionClass = 'toast-bottom-right';
    }

    var config = {
        appErrorPrefix: '[Flickr Feed Error] ', //Configure the exceptionHandler decorator
        appTitle: 'Flickr Public Feed',
        version: '1.0.0'
    };

    core.value('config', config);

    core.config(configure);

    /* @ngInject */
    function configure ($logProvider, $routeProvider, $locationProvider, routehelperConfigProvider, exceptionHandlerProvider) {
        // turn debugging off/on (no info or warn)
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }

        // Configure the common route provider
        routehelperConfigProvider.config.$routeProvider = $routeProvider;
        routehelperConfigProvider.config.docTitle = 'Flickr Public Feed : ';
        var resolveAlways = { /* @ngInject */


        };
        routehelperConfigProvider.config.resolveAlways = resolveAlways;

        // Configure the common exception handler
        exceptionHandlerProvider.configure(config.appErrorPrefix);

        $locationProvider.html5Mode(false);
    }
})();
