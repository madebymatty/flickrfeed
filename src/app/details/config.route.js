(function() {
    'use strict';

    angular
        .module('app.details')
        .run(appRun);

    // appRun.$inject = ['routehelper']

    /* @ngInject */
    function appRun(routehelper) {
        routehelper.configureRoutes(getRoutes());
    }

    function getRoutes() {
        return [
            {
                url: '/details/:photoId/:tagId',
                config: {
                    templateUrl: 'app/details/details.html',
                    controller: 'DetailsController',
                    controllerAs: 'details',
                    title: 'details',
                    settings: {
                        nav: 2,
                        content: '<i class="fa fa-lock"></i> Details'
                    }
                }
            }
        ];
    }
})();
