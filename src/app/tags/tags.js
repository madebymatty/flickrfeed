(function() {

    'use strict';

    angular
        .module('app.tags')
        .controller('TagsController', TagsController);

    function TagsController(logger, $http, $routeParams, $scope) {

        /* jshint validthis: true */
        var tags = this;
        tags.title = 'Tags';
        $http.jsonp('http://api.flickr.com/services/feeds/photos_public.gne?tags='+$routeParams.tagId+'&tagmode=all&format=json&jsoncallback=JSON_CALLBACK')
        .success(function(data){
            tags.photos = data;
            tags.pics = [];
            angular.forEach(tags.photos.items, function(item){

                var url = item.link;
                var urlArray = url.split('/');
                var lastSegment = urlArray[urlArray.length-2];

                tags.pics = tags.pics.concat([
                    {
                      title : item.title,
                      link : item.link,
                      author : item.author.match(/\((.*)\)/i)[1],
                      author_id : item.author_id,
                      published : item.published,
                      media : item.media.m,
                      photoid : lastSegment,
                      tagid : $routeParams.tagId
                    }
                ]);
            })
        })
        .error(function(d){ console.log( "nope" ); });

        $scope.$watch('search', function(val)
        {
            if (val) {

                $http.jsonp('http://api.flickr.com/services/feeds/photos_public.gne?tags='+val+'&tagmode=all&format=json&jsoncallback=JSON_CALLBACK')
                .success(function(data){
                    tags.photos = data;
                    tags.pics = [];
                    angular.forEach(tags.photos.items, function(item){

                        var url = item.link;
                        var urlArray = url.split('/');
                        var lastSegment = urlArray[urlArray.length-2];

                        tags.pics = tags.pics.concat([
                            {
                              title : item.title,
                              link : item.link,
                              author : item.author.match(/\((.*)\)/i)[1],
                              author_id : item.author_id,
                              published : item.published,
                              media : item.media.m,
                              photoid : lastSegment,
                              tagid : $routeParams.tagId
                            }
                        ]);
                    })
                })
                .error(function(d){ console.log( "nope" ); });

            }
        });
    }
})();
