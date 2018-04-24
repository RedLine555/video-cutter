var db = require('./mongoose');
var mongoose = require('mongoose');

// database connect
var db = db.getDBConnection();

// Create a Mongoose schema
var FileSchema = new mongoose.Schema({
    filename: String,
    outFilename: String,
    startTime: String,
    endTime: String,
    duration: Number,
    status:  String,
    error: String
});

// Register the schema
var _File = mongoose.model('file', FileSchema);

exports.File = _File;