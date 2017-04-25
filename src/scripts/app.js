// Init the worker
var cacheWorker = new SharedWorker('src/scripts/worker.js');
var cb = {};
cacheWorker.port.addEventListener('message', function(e) {
	var res = e.data;
    if (res['success']){
        cb[res['route']](res['data']);
    } else {
        console.log(res);
    }
}, false);
cacheWorker.port.start();

getXHR = function(route, _cb){
    cb[route] = _cb;
    cacheWorker.port.postMessage({
        route: route
    });
}

getPhotosByAlbum = function(albumId){
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

// Load the album list
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