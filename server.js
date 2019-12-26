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
                        link: null
                    });
                });

            }
        });
    } catch (error) {
        console.log('Error: ' + error.message);
    }


});


const server = app.listen(process.env.PORT || 8099, () => {
    const port = server.address().port;
    console.log(`Server is listening at port ${port}`);
});

