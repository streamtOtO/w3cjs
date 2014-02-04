var request = require('superagent');
var proxyRequest = require('superagent-proxy')(request);

var fs = require('fs');

var w3cHtmlCheckUrl = 'http://validator.w3.org/check';
var w3cCssCheckUrl = 'http://www.css-validator.org/validator';
var defaultOutput = 'json';
var defaultDoctype = null;
var defaultCharset = null;
var defaultProxy = null;
var defaultValidate = 'html';
var defaultProfile = 'css3';
var defaultMedium = 'all';
var defaultWarnings = 'no';

var defaultCallback = function (res) {
    console.log(res);
};

function setW3cHtmlCheckUrl(newW3cHtmlCheckUrl) {
    w3cHtmlCheckUrl = newHtmlW3cHtmlCheckUrl;
}

function setW3cCssCheckUrl(newW3cCssCheckUrl) {
    w3cCssCheckUrl = newHtmlW3cCssCheckUrl;
}

function validate(options) {
    var output = options.output || defaultOutput;
    var callback = options.callback || defaultCallback;
    var doctype = options.doctype || defaultDoctype;
    var charset = options.charset || defaultCharset;
    var file = options.file;
    var input = options.input;

    var validate = options.validate || defaultValidate;
    var profile = options.profile || defaultProfile;
    var medium = options.medium || defaultMedium;
    var warnings = options.warnings || defaultWarnings;

    var type;
    if(typeof input !== 'undefined'){
        type = 'string';
    } else if(typeof file !== 'undefined' && (file.substr(0,5) === 'http:' || file.substr(0, 6) === 'https:')){
        type = 'remote';
    } else if(typeof file !== 'undefined'){
        type = 'local';
    } else {
        return false;
    }

    var req = getRequest(type !== 'remote', options);

    if(type === 'remote') {
        req.query({ output: output });
        req.query({ uri: file });
        if(doctype !== null) req.query({doctype: doctype});
        if(charset !== null) req.query({charset: charset});
    } else {
        req.field('output', output);
        var uploadedFile = (type === 'local') ? fs.readFileSync(file, 'utf8') : input;
        req.field('uploaded_file', uploadedFile);
        if(doctype !== null) req.field('doctype', doctype);
        if(charset !== null) req.field('charset', charset);

        if (validate === 'css'){
            req.field('output', 'html');
            req.field('type', 'css');
            req.field('extended', 'true');
            req.field('lang', 'en');
            req.field('profile', profile);
            req.field('usermedium', medium);
            req.field('warning', warnings);
            req.field('text', uploadedFile);
        }
    }
    req.end(function(res){

        if (validate === 'css'){
            var cssResult = parseCssValidation(res.text);
            callback(cssResult);

        } else {
            if(output === 'json'){
                callback(res.body);
            } else {
                callback(res.text);
            }
        }
    });
}

var trim = function(string) {
    string = string || '';
    return string.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');
};

var parseCssValidation = function(resultHtml){

    var messages = [];

    require('xml2js').parseString(resultHtml, function(err, result){

        var results = result.html.body[0]
            .div[1].div[0].div[0].div[0]
            .table[0].tr;

        for (var i = 0; i < results.length; i++) {
            var line = trim(results[i].td[0]._);
            var selector = trim(results[i].td[1]._);
            var message = trim(results[i].td[2]._);
            var description = '';
            try {
                description = trim(results[i].td[2].span[0]._);
            } catch (e) {
                description = trim(results[i].td[2]._);
            }

            messages.push({
                'lastLine': line,
                'lastColumn': 0,
                'message': selector + ': ' + message + ' ' + description,
                'messageid': 'css',
                'explanation': '',
                'type': 'error'
            });
        }
    });

    return {
        'url': 'upload://Form Submission',
        'messages': messages,
        'source': {
            'encoding': 'utf-8',
            'type': ''
        }
    };

};

var getRequest = function(isLocal, options) {
    var req;
    if (options.validate == 'css'){
        req = isLocal ? proxyRequest.post(w3cCssCheckUrl) : proxyRequest.get(w3cCssCheckUrl);
    } else {
        req = isLocal ? proxyRequest.post(w3cHtmlCheckUrl) : proxyRequest.get(w3cHtmlCheckUrl);
    }

    var proxy = options.proxy || defaultProxy;
    if (proxy !== null) {
       req.proxy(proxy);
    }

    req.set('User-Agent', 'w3cjs - npm module');

    return req;
};

var w3cjs = {
    validate: validate,
    setW3cHtmlCheckUrl: setW3cHtmlCheckUrl,
    setW3cCssCheckUrl: setW3cCssCheckUrl
};
if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = w3cjs;
  }
  exports.w3cjs = w3cjs;
} else {
  root['w3cjs'] = w3cjs;
}
