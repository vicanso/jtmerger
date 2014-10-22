assert = require 'assert'
jsc = require 'jscoverage'

mergerFile = '../dest'

if process.env.NODE_ENV == 'cov'
  JTMerger = jsc.require module, mergerFile
else
  JTMerger = require mergerFile

mergeInfo = 
  except : [
    '/components/jquery/dist/jquery.js'
  ]
  files : [
    [
      '/components/underscore/underscore.js'
      '/components/backbone/backbone.js'
    ]
    [
      '/components/seajs/sea.js'
      '/javascripts/sea_config.js'
    ]
  ]
pageComponentsInfos = 
  home : 
    js : [
      '/components/jquery/dist/jquery.js'
      '/components/underscore/underscore.js'
      '/components/backbone/backbone.js'
      '/components/seajs/sea.js'
      '/javascripts/sea_config.js'
      '/components/jtlazy_load/dest/jtlazy_load.js'
      '/javascripts/home.js'
    ]
    css : [
      '/components/normalize.css/normalize.css' 
    ]
    updatedAt : '2014-04-26 20:44:22'

describe 'Merger', ->
  jtMerger = new JTMerger mergeInfo

  describe '#getMergeExportFiles', ->
    it 'should get merge export files successful', ->
      files = [
        '/components/jquery/dist/jquery.js'
        '/components/underscore/underscore.js'
        '/components/backbone/backbone.js'
        '/components/seajs/sea.js'
        '/javascripts/sea_config.js'
        '/components/jtlazy_load/dest/jtlazy_load.js'
        '/javascripts/home.js'
      ]
      result = [
        '/components/jquery/dist/jquery.js'
        '/merge/underscore-backbone.js'
        '/merge/sea-sea_config.js'
        '/merge/jtlazy_load-home.js'
      ]
      assert.equal result.join(''), jtMerger.getMergeExportFiles(files).join ''
