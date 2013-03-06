/**
 * Created with JetBrains WebStorm.
 * User: chengqiang
 * Date: 13-1-22
 * Time: 下午5:07
 * To change this template use File | Settings | File Templates.
 */
var fs = require('fs'), path = require('path'), config = require(path.resolve('.')+'/conf/config'),root_path = config.baseDir;

exports.getAllFiles = function(dirPath){
     var res = [] , files = fs.readdirSync(dirPath);
     files.forEach(function(file){
         var pathname = path.join(dirPath, file), stat = fs.lstatSync(pathname);

         if (!stat.isDirectory()){
                res.push(pathname.replace(root_path,'.'));
             } else {
                res = res.concat(exports.getAllFiles(pathname));
             }
       });
       return res;
};