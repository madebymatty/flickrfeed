(function() {
    'use strict';

    angular
        .module('app.details')
        .run(appRun);

    /* @ngInject */
    function appRun(routehelper) {
        routehelper.configureRoutes(getRoutes());
    }

    function getRoutes() {
        return [
            {
                url: '/tags/:tagId',
                config: {
                    templateUrl: 'app/tags/tags.html',
                    controller: 'TagsController',
                    controllerAs: 'tags',
                    title: 'tags'
                }
            }
        ];
    }
})();
