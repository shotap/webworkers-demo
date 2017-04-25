var connections = 0; // count active connections
var cache = {};
var apiBasePath = 'https://jsonplaceholder.typicode.com/';

self.addEventListener('connect', function (e) {
	var port = e.ports[0];
	connections++;

	port.addEventListener('message', function (e) {
    var route = e.data['route'];
    if (cache[route]){
      port.postMessage('"' + route + '" from cache');
      port.postMessage(cache[route]);
    } else {
      var req = new XMLHttpRequest();
      port.postMessage('[' + route + '] not from cache');
      req.addEventListener('load', function(){
          cache[route] = {
            success: true,
            route: route,
            data: JSON.parse(this.responseText)
          };
        port.postMessage(cache[route]);
      });
      req.open('GET', apiBasePath + route);
      req.send();
    }
	}, false);

	port.start();
  port.postMessage('Welcome client #' + connections);
}, false);