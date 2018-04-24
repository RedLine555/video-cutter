var filesDomain = require('../domain/files');
var path = require('path');
var fs = require('fs');

const FILE_STATUSES = {
    DONE: 'done',
    FAILED: 'failed',
    SCHEDULED: 'scheduled',
    PROCESSING: 'processing',
}

exports.upload = async function (req, res) {
    let timeregexp = /^[0-9][0-9]:[0-5][0-9]:[0-5][0-9]$/;
    if (!timeregexp.test(req.body.startTime) || !timeregexp.test(req.body.endTime)) {
        return res.status(400).send("Wrong time format")
    }

    if (!req.files.video) {
        return res.status(400).send("No video loaded")        
    }

    const duration = filesDomain.countSeconds(req.body.endTime) - filesDomain.countSeconds(req.body.startTime);

    if (duration <= 0) {
        return res.status(400).send("Wrong time period")        
    }

    const filename = filesDomain.mutateFileName(req.files.video.name);
    
    var file = {
        startTime : req.body.startTime,
        endTime : req.body.endTime,
        filename: filename,
        outFilename: null,
        duration: duration,
        status: FILE_STATUSES.SCHEDULED,
        error: null,
    }

    file = await filesDomain.saveFile(file);
    res.json({id: file._id});

    await req.files.video.mv(path.resolve('videos/in/'+filename));
    filesDomain.cutFile(file)
        .then(resp => {
            file.status = FILE_STATUSES.DONE;
            file.outFilename = resp.name;
            filesDomain.saveFile(file);
        })
        .catch(err => {
            file.status = FILE_STATUSES.FAILED;
            file.error = err.message;
            filesDomain.saveFile(file);
        })
    file.status = FILE_STATUSES.PROCESSING;
    filesDomain.saveFile(file);
}

exports.retry = async function (req, res) {
    var fileId = req.params.id;

    var file = await filesDomain.getFile(fileId);
    file.status = FILE_STATUSES.PROCESSING;
    await filesDomain.saveFile(file);
    res.json({id: file._id});

    filesDomain.cutFile(file)
        .then(resp => {
            file.status = FILE_STATUSES.DONE;
            file.outFilename = resp.name;
            filesDomain.saveFile(file);
        })
        .catch(err => {
            file.status = FILE_STATUSES.FAILED;
            file.error = err.message;
            filesDomain.saveFile(file);
        })
}

exports.status = async function (req, res) {
    var fileId = req.params.id;

    var file = await filesDomain.getFile(fileId);
    var result = {status: file.status};

    if (result.status === FILE_STATUSES.FAILED) {
        result.error = file.error;
    } else if (result.status === FILE_STATUSES.DONE) {
        result.outFilename = file.outFilename;
        result.duration = file.duration;
    }
    res.json(result);
}

exports.download = function (req, res) {
    var filename  = req.params.filename;
    if (!fs.existsSync(path)) {
        return res.status(404).send();
    }
    res.sendFile(path.resolve('videos/out/'+filename));
}