"use strict"
_ = require 'underscore'
path = require 'path'
fs = require 'fs'
async = require 'async'

class Merger
  constructor : (@mergeInfo) ->

  ###*
   * getMergeList 返回合并文件列表
   * @param  {[type]} pages           [description]
   * @param  {[type]} staticsDestPath [description]
   * @return {[type]}                 [description]
  ###
  getMergeList : (pages, staticsDestPath) ->
    mergeInfo = @mergeInfo
    filesInfos = []
    _.each mergeInfo.files, (tmpFiles) ->
      filesInfos.push getMergeInfo staticsDestPath, tmpFiles
    _.each pages, (value) =>
      delete value.modifiedAt
      _.each value, (tmpFiles) =>
        tmpFiles = @getRestFiles tmpFiles
        filesInfos.push getMergeInfo staticsDestPath, tmpFiles if tmpFiles.length
    _.object filesInfos
  getRestFiles : (files) ->
    mergeInfo = @mergeInfo
    mergeFiles = _.flatten mergeInfo.files
    mergeFiles = mergeFiles.concat mergeInfo.except if mergeInfo.except
    _.filter files, (file) ->
      !~_.indexOf mergeFiles, file
  ###*
   * getMergeExportFiles 获取合并的export files
   * @param  {[type]} files [description]
   * @return {[type]}       [description]
  ###
  getMergeExportFiles : (files) ->
    mergeInfo = @mergeInfo
    mergeFiles = _.flatten mergeInfo.files
    mergeFiles = mergeFiles.concat mergeInfo.except if mergeInfo.except
    exportFiles = []
    restFiles = []
    _.each files, (file) ->
      if ~_.indexOf mergeFiles, file
        result = _.find mergeInfo.files, (tmpFiles) ->
          ~_.indexOf tmpFiles, file
        exportFiles.push result || file
      else
        restFiles.push file
    exportFiles.push restFiles
    exportFiles = _.map _.uniq(exportFiles), (data) ->
      if _.isArray data
        if data.length == 1
          data[0]
        else
          getMergeFileName data
      else
        data
    exportFiles
  merge : (rootPath, saveFile, files) ->
    rImages = /([\s\S]*?)(url\(([^)]+)\))(?!\s*[;,]?\s*\/\*\s*ImageEmbed:skip\s*\*\/)|([\s\S]+)/img
    rQuotes = /['"]/g
    rParams = /([?#].*)$/g
    saveFile = path.join rootPath, saveFile
    savePath = path.dirname saveFile
    dataList = []

    _.each files, (file) ->
      dataList.push "/*#{file}*/"
      file = path.join rootPath, file
      src = fs.readFileSync file, 'utf8'
      if '.css' == path.extname file
        result = ''
        group = null
        async.whilst ->
          group = rImages.exec src
          group != null
        , (complete) ->
          if !group[4]
            result += group[1]
            img = group[3].trim().replace(rQuotes, '').replace(rParams, '')
            imgFile = path.join path.dirname(file), img
            result += "url(#{path.relative(savePath, imgFile)})"
          else
            result += group[4]
          complete()
        , (err)->
          if err
            throw err
          else
            dataList.push result
      else
        dataList.push src
    fs.writeFileSync saveFile, dataList.join '\n'

getMergeInfo = (staticsDestPath, tmpFiles) ->
  tmpArr = _.map tmpFiles, (file) ->
    path.join staticsDestPath, file
  dest = path.join staticsDestPath, getMergeFileName tmpFiles
  [dest, tmpArr]

getMergeFileName = (files) ->
  cutName = (file, ext) ->
    partList = _.compact file.split '/'
    basename = path.basename partList.pop(), ext
    partList.push basename
    partList.join '_'
  tmpArr = []
  tmpNames = []
  ext = path.extname files[0]
  _.each files, (file) ->
    tmpNames.push cutName file, ext
  "/merge/#{tmpNames.join(',')}#{ext}"
module.exports = Merger