(function() {
  var JTMerger, assert, jsc, mergeInfo, mergerFile, pageComponentsInfos;

  assert = require('assert');

  jsc = require('jscoverage');

  mergerFile = '../dest';

  if (process.env.NODE_ENV === 'cov') {
    JTMerger = jsc.require(module, mergerFile);
  } else {
    JTMerger = require(mergerFile);
  }

  mergeInfo = {
    except: ['/components/jquery/dist/jquery.js'],
    files: [['/components/underscore/underscore.js', '/components/backbone/backbone.js'], ['/components/seajs/sea.js', '/javascripts/sea_config.js']]
  };

  pageComponentsInfos = {
    home: {
      js: ['/components/jquery/dist/jquery.js', '/components/underscore/underscore.js', '/components/backbone/backbone.js', '/components/seajs/sea.js', '/javascripts/sea_config.js', '/components/jtlazy_load/dest/jtlazy_load.js', '/javascripts/home.js'],
      css: ['/components/normalize.css/normalize.css'],
      updatedAt: '2014-04-26 20:44:22'
    }
  };

  describe('Merger', function() {
    var jtMerger;
    jtMerger = new JTMerger(mergeInfo);
    return describe('#getMergeExportFiles', function() {
      return it('should get merge export files successful', function() {
        var files, result;
        files = ['/components/jquery/dist/jquery.js', '/components/underscore/underscore.js', '/components/backbone/backbone.js', '/components/seajs/sea.js', '/javascripts/sea_config.js', '/components/jtlazy_load/dest/jtlazy_load.js', '/javascripts/home.js'];
        result = ['/components/jquery/dist/jquery.js', '/merge/components_underscore_underscore,components_backbone_backbone.js', '/merge/components_seajs_sea,javascripts_sea_config.js', '/merge/components_jtlazy_load_dest_jtlazy_load,javascripts_home.js'];
        return assert.equal(result.join(''), jtMerger.getMergeExportFiles(files).join(''));
      });
    });
  });

}).call(this);
