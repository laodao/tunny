var formidable = require('formidable'),
    url = require("url"),
    util = require('util'),
    appUtil = require('./util'),
    path = require("path"),
    fs = require("fs"),
    ViewEngine = require('./view').ViewEngine,
    config = require(process.cwd() + '/conf/config'),
    contentTypes = require('./contentTypes'),
    route = require('./route'),
    constant = require('./constant'),
    logger = require('./logger').getLogger();

/**
 * 处理静态文件
 * @param req
 * @param res
 * @param filePath
 */
exports.handleStaticFile = function (req, res, filePath) {
    if (!filePath) {
        filePath = path.join(config.baseDir, constant.staticDir, url.parse(req.url).pathname);
    }
    path.exists(filePath, function (exists) {
        if (!exists) {
            handler404(res);
            return;
        }

        fs.readFile(filePath, "binary", function (err, file) {
            if (err) {
                handler500(res, err);
                return;
            }

            var ext = path.extname(filePath);
            ext = ext || '.html';
            res.writeHead(200, {
                'Content-Type':contentTypes.contentTypes[ext] || 'text/html'
            });
            res.write(file, "binary");
            res.end();
        });
    });
}

/**
 * 处理html文件
 * @param req
 * @param res
 * @param filePath
 */
exports.handleHtmlFile = function (req, res, filePath) {
    exports.handleStaticFile(req, res, filePath);
}

/**
 * 处理动态文件
 * @param req
 * @param res
 * @param filePath
 */
exports.handleDynamicFile = function (req, res, webForm) {
    var method = req.method ? req.method.toLowerCase() : 'get';

    //动态请求处理
    if (req.method.toUpperCase() == 'GET') {//处理get请求
        webForm.setReq(req);
        webForm.setMethod(method);
        invokeAction(req, res, webForm, send);
        return;
    } else if (req.method.toUpperCase() == 'POST') {//处理post请求
        var form = new formidable.IncomingForm();
        var fields = {};
        var files = {};
        form.on('field',
            function (field, value) {
                fields[field] = value;
            }).on('file',
            function (field, file) {
                files[field] = file;
            }).on('error',
            function (error) {
                handler500(res, "服务器发生错误，请稍候再试！");
            }).on('end', function () {
                webForm.setReq(req);
                webForm.setMethod(method);
                webForm.addAllParam(fields);
                webForm.setFiles(files);
                try {
                    invokeAction(req, res, webForm, send);
                } catch (e) {
                    logger.error(e.stack);
                    console.log(e.stack);
                    handler500(res, '服务器错误！');
                }
            });
        form.parse(req);
    } else if (req.method.toUpperCase() == 'HEAD') {
        res.end(null);
        return;
    }
}

function invokeAction(req, res, webForm, callback) {
    //var url = webForm.getUrl();
    //var suffix = path.extname(url);
    var viewPath = webForm.getController().getViewPath();
    //var controllerPath = webForm;
//	var action = require("../" + controllerPath);
    var fullPath = webForm.getController().getFullPath();
    if (config.env == 'dev') {
        delete( require.cache[ fullPath ] );
    }
    var action = require(fullPath);

    function render(ret) {
        if (typeof(ret) == 'string') {
            var _arr = ret.split(':');
            if (_arr.length != 2) {
                logger.error('action的返回格式不正确！');
                return null;
            } else {
                var t = _arr[0];
                if (t == '_r') {
                    redirect(req, res, _arr[1]);
                    return;
                }
                if (t == '_f') {
                    forward(req, res, _arr[1], webForm);
                    return;
                }
            }
        }
        if (webForm.getRetType() == 'json') {
            //callback(res, webForm, JSON.stringify(webForm.getData()), 'application/json');
        } else {
            var viewEngine = new ViewEngine(config.templateType);
            viewEngine.render(viewPath, webForm.getData(), function (retStr, err) {
                if(err){
                    handler500(res, err);
                }else{
                    callback(res, webForm, retStr);
                }
            });
        }
    }

    try {
        var actionName = webForm.getController().getActionName();
        var fn = action[actionName];
        if (action['before']) {
            action['before'](webForm, function (ret) {
                if (typeof(ret) == 'string') {
                    var _arr = ret.split(':');
                    if (_arr.length != 2) {
                        logger.error('action的返回格式不正确！');
                        handler500(res, 'action的返回格式不正确！');
                        return;
                    } else {
                        var t = _arr[0];
                        if (t == '_r') {
                            redirect(req, res, _arr[1]);
                            return;
                        }
                        if (t == '_f') {
                            forward(req, res, _arr[1], webForm);
                            return;
                        }
                    }
                }
                fn(webForm, render);
            });
        } else {
            fn(webForm, render);
        }
    } catch (e) {
        logger.error(e.stack);
        if (e.name == "TypeError") {
            exports.handleHtmlFile(req, res, config.err404Page);
        } else {
            handler500(res, "服务器发生错误，请稍候再试！");
        }
    }
}

/**
 * 客户端重定向
 * @param req
 * @param res
 * @param url
 */
var redirect = function (req, res, url) {
    var base = config.basePath
        , head = 'HEAD' == req.method
        , status = 302
        , body;
    if (!~url.indexOf('://')) {
        if ('/' != base && 0 != url.indexOf(base)) url = base + url;
        var host = req.headers.host
            , tls = req.secure;
        url = 'http' + (tls ? 's' : '') + '://' + host + url;
    }
    if (req.accepts('html')) {
        body = '<p>' + statusCodes[status] + '. Redirecting to <a href="' + url + '">' + url + '</a></p>';
        res.header('Content-Type', 'text/html');
    } else {
        body = statusCodes[status] + '. Redirecting to ' + url;
        res.header('Content-Type', 'text/plain');
    }

    // Respond
    res.statusCode = status;
    res.header('Location', url);
    res.end(head ? null : body);
};

/**
 * 服务端重定向
 * @param req
 * @param res
 * @param url
 */
var forward;
forward = function (req, res, newUrl, oldWebForm) {
    var webForm = route.getWebForm(newUrl);
    if (webForm) {
        webForm.setMethod(oldWebForm.getMethod());
        webForm.addAllParam(oldWebForm.getParams());
        webForm.setFiles(oldWebForm.getFiles());
        webForm.setData(oldWebForm.getData());
        webForm.setCookies(oldWebForm.getCookies());
        webForm.setReq(req);
        invokeAction(req, res, webForm, send);
    } else {
        handler404(res);
    }
};

var handler404 = function (res) {
    res.writeHead(404, {
        'Content-Type':'text/plain'
    });
    res.end('Page Not Found');
};

var handler500 = function (res, err) {
    res.writeHead(500, {
        'Content-Type':'text/plain'
    });
    res.end(err.toString());
};

var handlerError = function (error, res) {
    var viewPath = config.errorFile;
    var viewEngine = new ViewEngine(config.templateType);
    viewEngine.render(viewPath, error, res);
}

var send = function (res, webForm, retStr, contentType) {
    var cookies = webForm.getCookies();
    var setCookies = [];
    if (contentType) {
        res.setHeader("Content-Type", contentType);
    }
    for (var i = 0; i < cookies.length; i++) {
        setCookies[setCookies.length] = ['Set-Cookie', cookies[i].serialize()];
    }
    res.writeHead(200, setCookies);
    res.end(retStr, "utf8");
}