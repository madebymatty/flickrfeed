(function() {
    'use strict';

    angular
        .module('app.details')
        .controller('DetailsController', DetailsController);

    /* @ngInject */
    function DetailsController(logger, $http, $routeParams) {
        /*jshint validthis: true */
        var details = this;
        details.title = 'Page';

        $http.jsonp('http://api.flickr.com/services/feeds/photos_public.gne?tags='+$routeParams.tagId+'&tagmode=all&format=json&jsoncallback=JSON_CALLBACK')
        .success(function(data){
            details.photos = data;
            details.pic = [];
            angular.forEach(details.photos.items, function(item, count){

                var url = item.link;
                var urlArray = url.split('/');
                var lastSegment = urlArray[urlArray.length-2];

                if ($routeParams.photoId == lastSegment ) {

                    var authorName = item.author.match(/\((.*)\)/i)[1];
                    details.pic.title = item.title;
                    details.pic.author = authorName;
                    details.pic.author_id = item.author_id;
                    details.pic.tags = item.tags;
                    details.pic.published = item.published;
                    details.pic.link = item.link;
                    details.pic.media = item.media.m;
                    details.pic.description = item.description;

                    var descReplace = item.link.replace($routeParams.photoId+'/', '');
                    var descReplace = descReplace.replace('photos', 'people');
                    var descReplace1 = item.description.replace('<p><a href="'+descReplace+'">'+authorName+'</a> posted a photo:</p>', '');
                    var descReplace2 = descReplace1.replace('<p><a href="'+item.link+'" title="'+item.title+'">', '');
                    var descReplace3 = descReplace2.replace(/<img[^>]+>/, '');
                    var descReplace4 = descReplace3.replace('</a></p>', '');
                    details.pic.description = descReplace4;

                    var tokens = item.tags.split(/\s+/g);

                    var tagging = '<ul class="photo-item__tags"><li><p>Tags:</p></li>';
                    for(var x = 0; x < tokens.length; x++){
                        tagging = tagging +'<li><a href="/#/tags/'+tokens[x]+'">'+tokens[x]+'</a> </li>';
                    }
                    details.pic.tags = tagging + '</ul>';
                }
                count++;
            })
        })
        .error(function(d){ console.log( "nope" ); });
    }
})();
