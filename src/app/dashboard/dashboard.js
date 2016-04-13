(function() {
    'use strict';

    angular
        .module('app.dashboard')
        .controller('DashboardController', DashboardController);

    /* @ngInject */
    function DashboardController(logger, $http, $scope) {

        /*jshint validthis: true */
        var db = this;
        db.listing = [];
        db.title = 'Flickr Public Feed';
        var val = 'potato';
        $http.jsonp('http://api.flickr.com/services/feeds/photos_public.gne?tags='+val+'&tagmode=all&format=json&jsoncallback=JSON_CALLBACK')
        .success(function(data){
            db.photos = data;
            db.pics = [];
            angular.forEach(db.photos.items, function(item){

                var url = item.link;
                var urlArray = url.split('/');
                var lastSegment = urlArray[urlArray.length-2];

                db.pics = db.pics.concat([
                    {

                      title : item.title,
                      link : item.link,
                      author : item.author.match(/\((.*)\)/i)[1],
                      author_id : item.author_id,
                      published : item.published,
                      media : item.media.m,
                      photoid : lastSegment,
                      tagid : val
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
                    db.photos = data;
                    db.pics = [];
                    angular.forEach(db.photos.items, function(item){

                        var url = item.link;
                        var urlArray = url.split('/');
                        var lastSegment = urlArray[urlArray.length-2];

                        db.pics = db.pics.concat([
                            {
                                title : item.title,
                                link : item.link,
                                author : item.author.match(/\((.*)\)/i)[1],
                                author_id : item.author_id,
                                published : item.published,
                                media : item.media.m,
                                photoid : lastSegment,
                                tagid : val
                            }
                        ]);
                    })
                })
                .error(function(d){ console.log( "nope" ); });
            }
        });
    }
})();
