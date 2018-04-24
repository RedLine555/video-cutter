var file = require('./files');
var test = require('./test');

exports.assignRoutes = function (app) {
    app.post('/file', file.upload);
    app.post('/file/:id/retry', file.retry);
    app.get('/file/:id/status', file.status);
    app.get('/file/download/:filename', file.download);

    app.get('/test', test.testPage);
}