(function() {
  "use strict";
  var Merger, async, fs, getMergeFileName, getMergeInfo, path, _;

  _ = require('underscore');

  path = require('path');

  fs = require('fs');

  async = require('async');

  Merger = (function() {
    function Merger(mergeInfo) {
      this.mergeInfo = mergeInfo;
    }


    /**
     * getMergeList 返回合并文件列表
     * @param  {[type]} pages           [description]
     * @param  {[type]} staticsDestPath [description]
     * @return {[type]}                 [description]
     */

    Merger.prototype.getMergeList = function(pages, staticsDestPath) {
      var filesInfos, mergeInfo;
      mergeInfo = this.mergeInfo;
      filesInfos = [];
      _.each(mergeInfo.files, function(tmpFiles) {
        return filesInfos.push(getMergeInfo(staticsDestPath, tmpFiles));
      });
      _.each(pages, (function(_this) {
        return function(value) {
          delete value.modifiedAt;
          return _.each(value, function(tmpFiles) {
            tmpFiles = _this.getRestFiles(tmpFiles);
            if (tmpFiles.length) {
              return filesInfos.push(getMergeInfo(staticsDestPath, tmpFiles));
            }
          });
        };
      })(this));
      return _.object(filesInfos);
    };

    Merger.prototype.getRestFiles = function(files) {
      var mergeFiles, mergeInfo;
      mergeInfo = this.mergeInfo;
      mergeFiles = _.flatten(mergeInfo.files);
      if (mergeInfo.except) {
        mergeFiles = mergeFiles.concat(mergeInfo.except);
      }
      return _.filter(files, function(file) {
        return !~_.indexOf(mergeFiles, file);
      });
    };


    /**
     * getMergeExportFiles 获取合并的export files
     * @param  {[type]} files [description]
     * @return {[type]}       [description]
     */

    Merger.prototype.getMergeExportFiles = function(files) {
      var exportFiles, mergeFiles, mergeInfo, restFiles;
      mergeInfo = this.mergeInfo;
      mergeFiles = _.flatten(mergeInfo.files);
      if (mergeInfo.except) {
        mergeFiles = mergeFiles.concat(mergeInfo.except);
      }
      exportFiles = [];
      restFiles = [];
      _.each(files, function(file) {
        var result;
        if (~_.indexOf(mergeFiles, file)) {
          result = _.find(mergeInfo.files, function(tmpFiles) {
            return ~_.indexOf(tmpFiles, file);
          });
          return exportFiles.push(result || file);
        } else {
          return restFiles.push(file);
        }
      });
      exportFiles.push(restFiles);
      exportFiles = _.map(_.uniq(exportFiles), function(data) {
        if (_.isArray(data)) {
          if (data.length === 1) {
            return data[0];
          } else {
            return getMergeFileName(data);
          }
        } else {
          return data;
        }
      });
      return exportFiles;
    };

    Merger.prototype.merge = function(rootPath, saveFile, files) {
      var dataList, rImages, rParams, rQuotes, savePath;
      rImages = /([\s\S]*?)(url\(([^)]+)\))(?!\s*[;,]?\s*\/\*\s*ImageEmbed:skip\s*\*\/)|([\s\S]+)/img;
      rQuotes = /['"]/g;
      rParams = /([?#].*)$/g;
      saveFile = path.join(rootPath, saveFile);
      savePath = path.dirname(saveFile);
      dataList = [];
      _.each(files, function(file) {
        var group, result, src;
        dataList.push("/*" + file + "*/");
        file = path.join(rootPath, file);
        src = fs.readFileSync(file, 'utf8');
        if ('.css' === path.extname(file)) {
          result = '';
          group = null;
          return async.whilst(function() {
            group = rImages.exec(src);
            return group !== null;
          }, function(complete) {
            var img, imgFile;
            if (!group[4]) {
              result += group[1];
              img = group[3].trim().replace(rQuotes, '').replace(rParams, '');
              imgFile = path.join(path.dirname(file), img);
              result += "url(" + (path.relative(savePath, imgFile)) + ")";
            } else {
              result += group[4];
            }
            return complete();
          }, function(err) {
            if (err) {
              throw err;
            } else {
              return dataList.push(result);
            }
          });
        } else {
          return dataList.push(src);
        }
      });
      return fs.writeFileSync(saveFile, dataList.join('\n'));
    };

    return Merger;

  })();

  getMergeInfo = function(staticsDestPath, tmpFiles) {
    var dest, tmpArr;
    tmpArr = _.map(tmpFiles, function(file) {
      return path.join(staticsDestPath, file);
    });
    dest = path.join(staticsDestPath, getMergeFileName(tmpFiles));
    return [dest, tmpArr];
  };

  getMergeFileName = function(files) {
    var ext, tmpArr, tmpNames;
    tmpArr = [];
    tmpNames = [];
    ext = path.extname(files[0]);
    tmpNames = _.map(files, function(file) {
      return path.basename(file, ext);
    });
    return "/merge/" + (tmpNames.join('-')) + ext;
  };

  module.exports = Merger;

}).call(this);
