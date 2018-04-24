var filesDB = require('../db/files');
var Files = filesDB.File;
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');

exports.cutFile = function (fileData) {
    return new Promise((resolve, reject) => {

        const out_name = exports.mutateFileName(fileData.filename);

        ffmpeg(path.resolve('videos/in/'+fileData.filename))
            .setStartTime(fileData.startTime)
            .setDuration(fileData.duration)
            .output(path.resolve('videos/out/'+out_name))

            .on('end', (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        name: out_name,
                    });
                }
            })
            .on('error', (err) => {
                console.log('error: ', +err);
                reject(err)
            }).run()
    });
};

exports.saveFile = function (fileData) {
    let file = new Files(fileData);
    return file.save();
}

exports.getFile = function (id) {
    return Files.findById(id).exec();
}

exports.mutateFileName = function(filename) {
    const salt = Math.floor(1000000 * Math.random());
    const [name, extention] = filename.split('.');
    const out_name = name + salt + '.' + extention;
    return out_name;
}

exports.countSeconds = function(time) {
    let [hours, minutes, seconds] = time.split(':');
    return hours * 60 * 60 + minutes * 60 + seconds;
}