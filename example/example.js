var w3cjs = require('../lib/w3cjs');

var results = w3cjs.validate({
    file: 'style.css', // file can either be a local file or a remote file
    //file: 'http://html5boilerplate.com/',
    //input: '<html>...</html>',
    //input: myBuffer,
    output: 'json', // Defaults to 'json', other option includes html
    doctype: 'HTML5', // Defaults false for autodetect
    charset: 'utf-8', // Defaults false for autodetect
    //proxy: 'http://proxy:8080', // Default to null
    callback: function (res) {
        console.log(res);
        // depending on the output type, res will either be a json object or a html string
    },
    // section for css validation
    validate: 'css', // defaults to html
    profile: 'css3', // possible profiles are: none, css1, css2, css21, css3, svg, svgbasic, svgtiny, mobile, atsc-tv, tv
    medium: 'all', // possible media are: all, aural, braille, embossed, handheld, print, projection, screen, tty, tv, presentation
    warnings: 'no' // possible warnings are: 2 (all), 1 (normal), 0 (most important), no (no warnings)

});