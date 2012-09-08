var formidable = require('formidable'),
    http = require("http"),
    mime = require('mime'),
    statusCodes = http.STATUS_CODES,
    url = require("url"),
    util = require('util'),
    appUtil = require('./util'),
    path = require("path"),
    fs = require("fs"),
    ViewEngine = require('./view').ViewEngine,
    config = require(path.resolve('.')+'/conf/config'),
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
        filePath = path.join(config.baseDir, config.staticFileDir, url.parse(req.url).pathname);
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
exports.handleDynamicFile = function (req, res, action, webForm) {
    var method = req.method ? req.method.toLowerCase() : 'get';

    //动态请求处理
    if (req.method.toUpperCase() == 'GET') {//处理get请求
        webForm.setReq(req);
        webForm.setMethod(method);
        invokeAction(req, res, action, webForm, send);
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
                invokeAction(req, res, action, webForm, send);
            });
        form.parse(req);
    } else if (req.method.toUpperCase() == 'HEAD') {
        res.end(null);
        return;
    }
}

function invokeAction(req, res, action, webForm, callback) {
//    var controllerPath = controller.getFullPath();
//    if (config.env == constant.devEnv) {
//        delete( require.cache[ controllerPath ] );
//    }
//    var action = require(controllerPath);
    var viewPath = action.getViewPath();
    var interceptor = action.getInterceptor();

//    var actionName = action.getActionName();
    var fn = action.getHandler();

    //解析并处理action返回的字符串
//    function parseRet(ret, fn){
//        if(ret==='json'){
//            callback(res, webForm, JSON.stringify(webForm.getData()), 'application/json');
//        }else{
//            fn();
//        }
//    }

    //根据返回值渲染页面
    function render() {
        interceptor.after(webForm, function(){//执行after拦截器，无论after拦截器做了什么操作，或者返回什么，请求都将继续执行下去
            var viewEngine = new ViewEngine(config.templateType);
            viewEngine.render(viewPath, webForm.getData(), function (retStr, err) {
                if(err){
                    handler500(res, '渲染页面发生错误：'+err.toString()+'，请检查模板是否存在，且语法无误！');
                }else{
                    callback(res, webForm, retStr);
                }
            });
        });
    }

    render.forward = function(path){
        interceptor.after(webForm, function(){//执行after拦截器，无论after拦截器做了什么操作，或者返回什么，请求都将继续执行下去
            forward(req, res, path, webForm);
        });
        //return;
    };

    render.redirect = function(path){
        interceptor.after(webForm, function(){//执行after拦截器，无论after拦截器做了什么操作，或者返回什么，请求都将继续执行下去
            redirect(req, res, path);
        });
    };

    render.json = function(){
        interceptor.after(webForm, function(){//执行after拦截器，无论after拦截器做了什么操作，或者返回什么，请求都将继续执行下去
            callback(res, webForm, JSON.stringify(webForm.getData()), 'application/json');
        });
    };

    render.error = function(err){
        //forward(req, res, path);
        return;
    };

    function beforeRender(){
        fn(webForm, render);//执行action方法
    }

    beforeRender.redirect = render.redirect;
    beforeRender.forward = render.forward;
    beforeRender.error = render.error;

    interceptor.before(webForm, beforeRender);
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
    var accept = req.headers['accept']
    if (accepts('html', accept)) {
        body = '<p>' + statusCodes[status] + '. Redirecting to <a href="' + url + '">' + url + '</a></p>';
        res.setHeader('Content-Type', 'text/html');
    } else {
        body = statusCodes[status] + '. Redirecting to ' + url;
        res.setHeader('Content-Type', 'text/plain');
    }

    // Respond
    res.statusCode = status;
    res.setHeader('Location', url);
    res.end(head ? null : body);
};

function accepts (type, accept){
    var type = String(type);

    // when not present or "*/*" accept anything
    if (!accept || '*/*' == accept) return true;

    // normalize extensions ".json" -> "json"
    if ('.' == type[0]) type = type.substr(1);

    // allow "html" vs "text/html" etc
    if (!~type.indexOf('/')) type = mime.lookup(type);

    // check if we have a direct match
    if (~accept.indexOf(type)) return true;

    // check if we have type/*
    type = type.split('/')[0] + '/*';
    return !! ~accept.indexOf(type);
};

/**
 * 服务端重定向
 * @param req
 * @param res
 * @param url
 */
var forward = function (req, res, newUrl, webForm) {
    var controller = route.getController(newUrl);
//    var webForm = route.getWebForm(newUrl);
    if (controller) {
//        webForm.setMethod(oldWebForm.getMethod());
//        webForm.addAllParam(oldWebForm.getParams());
//        webForm.setFiles(oldWebForm.getFiles());
//        webForm.setData(oldWebForm.getData());
//        webForm.setCookies(oldWebForm.getCookies());
//        webForm.setReq(req);
        invokeAction(req, res, controller, webForm, send);
    } else {
        console.log('没有找到url：'+newUrl+'对应的controller。')
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

//var handlerError = function (error, res) {
//    var viewPath = config.errorFile;
//    var viewEngine = new ViewEngine(config.templateType);
//    viewEngine.render(viewPath, error, res);
//};

var send = function (res, webForm, retStr, contentType) {
    var req = webForm.getReq();
    var cookies = webForm.getCookies();
    var setCookies = [];
    if (contentType) {
        res.setHeader("Content-Type", contentType);
    }
    var l = cookies.length;
    var keys = cookies.getKeys();
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        setCookies[setCookies.length] = ['Set-Cookie', cookies.get(key).serialize()];
    }
    var clientIP = req.headers['x-forwarded-for']
        || req.connection.remoteAddress;
    //logger.info('response at '+new Date().toString()+",client ip:"+clientIP+',http status 200');
    res.writeHead(200, setCookies);
    res.end(retStr, "utf8");
};
