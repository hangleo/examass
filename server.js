const express = require('express');
const app = express();
var ExifImage = require('exif').ExifImage;
var fs = require("fs");
var multer = require('multer');
var upload = multer({
    dest: 'upload/'
})
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.use('/', express.static('index'));

app.get('/index.html', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/', (req, res) => {
    res.redirect('/index.html');
});

app.post('/uploadphoto', upload.single('filetoupload'), function (req, res) {
    let title = req.body.title;
    console.log('title' + title);
    let desc = req.body.description;
    console.log('desc' + desc);
    let mimetype = req.file.type;
    const imagefile = req.file.path;
    values = {};
    try {
        new ExifImage({
            image: imagefile
        }, function (error, exifData) {
            if (error)
                console.log('Error: ' + error.message);
            else {
                values['make'] = JSON.stringify(exifData.image.Make);
                values['modle'] = JSON.stringify(exifData.image.Model);
                values['createdtime'] = JSON.stringify(exifData.exif.CreateDate);

                if (exifData.gps.GPSLatitudeRef == 'S') {
                    values['GPSLatitude'] = exifData.gps.GPSLatitude[0] + exifData.gps.GPSLatitude[1] / 60 + exifData.gps.GPSLatitude[2] / 60 / 60;
                    values['GPSLatitude'] = '-' + values['GPSLatitude'];
                } else
                    values['GPSLatitude'] = exifData.gps.GPSLatitude[0] + exifData.gps.GPSLatitude[1] / 60 + exifData.gps.GPSLatitude[2] / 60 / 60;

                if (exifData.gps.GPSLongitudeRef == 'W') {
                    values['GPSLongitude'] = exifData.gps.GPSLongitude[0] + exifData.gps.GPSLongitude[1] / 60 + exifData.gps.GPSLongitude[2] / 60 / 60;
                    values['GPSLongitude'] = '-' + values['GPSLongitude'];
                } else
                    values['GPSLongitude'] = exifData.gps.GPSLongitude[0] + exifData.gps.GPSLongitude[1] / 60 + exifData.gps.GPSLongitude[2] / 60 / 60;
                console.log('GPSLatitude ' + values['GPSLatitude']);
                console.log('GPSLongitude ' + values['GPSLongitude']);
                //values['lat'] = JSON.stringify(exifData.
                console.log('make ' + values['make']);
                console.log('modle ' + values['modle']);
                console.log('createdtime ' + values['createdtime']);
                fs.readFile(req.file.path, (err, data) => {
                    values['base64'] = new Buffer.from(data).toString('base64');
                    res.render('uploadphoto', {
                        title: title,
                        desc: desc,
                        make: values['make'],
                        model: values['modle'],
                        createdtime: values['createdtime'],
                        image: 'data:image/jpg;base64,' + values['base64'],
                        link: 'maps/' + values['GPSLatitude'] + '/' + values['GPSLongitude'] + '/12'
                    });
                });

            }
        });
    } catch (error) {
        console.log('Error: ' + error.message);
    }
});
app.get('/maps/:lat/:lng/:zoom', function (req, res) {
    res.render('maps', {
        lat: req.params.lat,
        lng: req.params.lng,
        zoom: req.params.zoom
    });
});

const server = app.listen(process.env.PORT || 8099, () => {
    const port = server.address().port;
    console.log(`Server is listening at port ${port}`);
});

