var consoleLog = function(token){
    document.querySelector('.console').innerHTML += '<div>' + token + '</div>';
}

// Init the worker
var cacheWorker;
if (window.SharedWorker){
    cacheWorker = new SharedWorker('src/scripts/worker.js');
} else {
    cacheWorker = null;
    consoleLog('no SharedWorker - working normal');
}
var cb = {};
var timers = {};
var apiBasePath = 'https://jsonplaceholder.typicode.com/';

if (cacheWorker){
    cacheWorker.port.addEventListener('message', function(e) {
        var res = e.data;
        if (res['success']){
            cb[res['route']](res['data']);

            var now = new Date();
            consoleLog('[' + res['route'] + '] ' + (now - timers[res['route']]) + 'ms');
        } else {
            consoleLog(res);
        }
    }, false);
    cacheWorker.port.start();
}

var getXHR = function(route, _cb){
    if (cacheWorker){
        cb[route] = _cb;
        timers[route] = new Date();
        cacheWorker.port.postMessage({
            route: route
        });
    } else { //fallback
        var req = new XMLHttpRequest();
        req.addEventListener('load', function(){
            _cb(JSON.parse(this.responseText));
        });
        req.open('GET', apiBasePath + route);
        req.send();
    }
}

var getPhotosByAlbum = function(albumId){
    getXHR('photos?albumId=' + albumId, function(photos){
        var photosListElem = document.querySelector('#photosList');
        photosListElem.innerHTML = '';

        photos.forEach(function(photo) {
            var photoItemElem = document.createElement('li');
            var photoImgElem = document.createElement('img');
            var photoTitleElem = document.createElement('div');

            photoImgElem.setAttribute('src', photo['thumbnailUrl']);
            photoItemElem.appendChild(photoImgElem);
            photoTitleElem.appendChild(document.createTextNode(photo.title));
            photoItemElem.appendChild(photoTitleElem);
            photoItemElem.setAttribute('data-id', photo.id);
            photosListElem.appendChild(photoItemElem);
        }, this);
    });
}

getXHR('albums', function(albums){
    var albumListElem = document.querySelector('#albumList');

    albums.forEach(function(album) {
        var albumItemElem = document.createElement('li');

        albumItemElem.appendChild(document.createTextNode(album.title));
        albumItemElem.setAttribute('data-id', album.id);
        albumListElem.appendChild(albumItemElem);

        albumItemElem.addEventListener('click', function(){
            getPhotosByAlbum(album.id);
        });
    }, this);
});

document.querySelector('.console-btn').addEventListener('click', function(){
    document.body.classList.toggle('open-console');
})