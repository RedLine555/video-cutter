'use strict';

var express = require('express');
var bodyparser = require('body-parser');
var fileUpload = require('express-fileupload');
var path = require('path');

var db = require('./db/mongoose');

var app = express();


db.DBConnect()
    .then(() => {
        var routes = require('./routes/routes');

        app.use(fileUpload());

        // configure app to use bodyParser()
        // this will let us get the data from a POST
        app.use(bodyparser.urlencoded({extended: true}));
        app.use(bodyparser.json({limit: '10mb'}));

        routes.assignRoutes(app);

        app.listen(3200);

        console.log('Server listening on port 3000');
    })
