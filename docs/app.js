(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("initialize.js", function(exports, require, module) {
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  // do your setup here

  // var IMask = require('imask');
  var numToWord = require('./lib/numtoword.js');
  var numToMonth = require('./lib/numtomonth.js');

  // *************************
  //  Templates
  // *************************

  var notarisKomparisi = "{!kelamin} {!namaLengkap}, lahir di {!kotaLahir}, pada tanggal {!numTanggalLahir}-{!numBulanLahir}-{!numTahunLahir} ({!lahirWord}), {!pekerjaan}, Warga Negara Indonesia, Pemegang Kartu Tanda Penduduk dengan Nomor Induk Kependudukan {!noKTP}, bertempat tinggal di {!alamat}, Rukun Tetangga {!RT}, Rukun Warga {!RW}, Kelurahan/Desa {!kelurahan}, Kecamatan {!kecamatan}, {!kotaTinggal}.";

  var ppatKomparisi = "{!kelamin} {!namaLengkap}, lahir di {!kotaLahir}, pada tanggal {!numTanggalLahir} ({!dayBornWord}) bulan {!monthBornWord} tahun {!numTahunLahir} ({!yearBornWord}), {!pekerjaan}, Warga Negara Indonesia, Pemegang Kartu Tanda Penduduk dengan Nomor Induk Kependudukan {!noKTP}, bertempat tinggal di {!kotaTinggal}, {!alamat}, Rukun Tetangga {!RT}, Rukun Warga {!RW}, Kelurahan/Desa {!kelurahan}, Kecamatan {!kecamatan}.";

  // *************************
  //  INPUT MASKING
  // *************************

  function inputNumeric(Input) {
    Input.addEventListener('keypress', function (e) {
      if (e.charCode < 48 || e.charCode > 57) {
        e.preventDefault();
        //console.log(e);
      }
    }, false);
  }

  var NumericInputs = document.querySelectorAll('.numericinput');
  for (var i = 0; i < NumericInputs.length; i++) {
    inputNumeric(NumericInputs[i]);
  }

  // *************************
  //  Form Sending
  // *************************


  // Get All input Value
  function getFormValue(formID) {
    var formContainer = document.querySelector(formID);
    var forms = formContainer.querySelectorAll('input, select, textarea');
    var obj = {};
    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];
      var name = form.name;
      var value = form.value;
      if (name) {
        obj[name] = value;
      }
    }
    return obj;
  }

  // change Title based on Gender and Martial Status

  function getNameTitle(martialstatus, gender) {
    if (gender === "male") {
      return "Tuan";
    } else if (gender == "female" && martialstatus !== "single") {
      return "Nyonya";
    }return "Nona";
  };

  // Parsing PPAT MODE
  function ppatParsing(Form) {
    var ktpValues = getFormValue(Form);
    var ktpBornDayWord = numToWord(ktpValues.bornday);
    var ktpBornMonthWord = numToMonth(ktpValues.bornmonth);
    var ktpBornYearWord = numToWord(ktpValues.bornyear);
    var birthdayWord = ktpBornDayWord + ' ' + ktpBornMonthWord + ' ' + ktpBornYearWord;
    var fullNameCaps = ktpValues.fullname.toUpperCase();
    var nameTitle = getNameTitle(ktpValues.martialstatus, ktpValues.gender);
    var ppatKomparisiResults = ppatKomparisi.replace("{!kelamin}", nameTitle).replace("{!namaLengkap}", fullNameCaps).replace("{!kotaLahir}", ktpValues.bornplace).replace("{!numTanggalLahir}", ktpValues.bornday).replace("{!dayBornWord}", ktpBornDayWord).replace("{!monthBornWord}", ktpBornMonthWord).replace("{!numTahunLahir}", ktpValues.bornyear).replace("{!yearBornWord}", ktpBornYearWord).replace("{!pekerjaan}", ktpValues.jobs).replace("{!noKTP}", ktpValues.nik).replace("{!kotaTinggal}", ktpValues.city).replace("{!alamat}", ktpValues.address).replace("{!RT}", ktpValues.rt).replace("{!RW}", ktpValues.rw).replace("{!kelurahan}", ktpValues.kelurahan).replace("{!kecamatan}", ktpValues.kecamatan);
    // Result
    return ppatKomparisiResults;
  }

  // Parsing Notaris MODE
  function notarisParsing(Form) {
    var ktpValues = getFormValue(Form);
    var ktpBornDayWord = numToWord(ktpValues.bornday);
    var ktpBornMonthWord = numToMonth(ktpValues.bornmonth);
    var ktpBornYearWord = numToWord(ktpValues.bornyear);
    var birthdayWord = ktpBornDayWord + ' ' + ktpBornMonthWord + ' ' + ktpBornYearWord;
    var fullNameCaps = ktpValues.fullname.toUpperCase();
    var nameTitle = getNameTitle(ktpValues.martialstatus, ktpValues.gender);
    var notarisKomparisiResults = notarisKomparisi.replace("{!kelamin}", nameTitle).replace("{!namaLengkap}", fullNameCaps).replace("{!kotaLahir}", ktpValues.bornplace).replace("{!numTanggalLahir}", ktpValues.bornday).replace("{!numBulanLahir}", ktpValues.bornmonth).replace("{!numTahunLahir}", ktpValues.bornyear).replace("{!lahirWord}", birthdayWord).replace("{!pekerjaan}", ktpValues.jobs).replace("{!noKTP}", ktpValues.nik).replace("{!kotaTinggal}", ktpValues.city).replace("{!alamat}", ktpValues.address).replace("{!RT}", ktpValues.rt).replace("{!RW}", ktpValues.rw).replace("{!kelurahan}", ktpValues.kelurahan).replace("{!kecamatan}", ktpValues.kecamatan);
    // Result
    return notarisKomparisiResults;
  }

  function submitForm() {
    var submitButton = document.querySelector('#submitButton');
    var resultTypeRadio = document.querySelector('input[name="resulttype"]');
    // Submit
    submitButton.addEventListener('click', function (e) {
      e.preventDefault();
      if (resultTypeRadio.checked) {
        var Result = notarisParsing('#ktpform');
        ResultBox.innerHTML = Result;
      } else {
        var Result = ppatParsing('#ktpform');
        ResultBox.innerHTML = Result;
      }

      console.log(resultTypeRadio.checked);
    }, false);
  }

  submitForm();

  console.log('Initialized app');
});
});

require.register("lib/numtomonth.js", function(exports, require, module) {
'use strict';

function numToMonth(s) {
  var MonthWord = '';
  var Month = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  var sNum = parseFloat(s);
  var MonthNumber = sNum - 1;
  MonthWord = Month[MonthNumber];
  return MonthWord;
}

module.exports = numToMonth;
});

require.register("lib/numtoword.js", function(exports, require, module) {
'use strict';

// Function for convert number to Indonesian Word
function numToWord(s) {
    var th = ['', 'ribu', 'juta', 'milyar', 'triliun'];
    var dg = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
    var tn = ['sepuluh', 'sebelas', 'dua belas', 'tiga belas', 'empat belas', 'lima belas', 'enam belas', 'tujuh belas', 'delapan belas', 'sembilan belas'];
    var tw = ['dua puluh', 'tiga puluh', 'empat puluh', 'lima puluh', 'enam puluh', 'tujuh puluh', 'delapan puluh', 'sembilan puluh'];

    s = s.toString();
    s = s.replace(/[\, ]/g, '');
    if (s != parseFloat(s)) return 'not a number';
    var x = s.indexOf('.');
    if (x == -1) x = s.length;
    if (x > 15) return 'too big';
    var n = s.split('');
    var str = '';
    var sk = 0;
    for (var i = 0; i < x; i++) {
        if ((x - i) % 3 == 2) {
            if (n[i] == '1') {
                str += tn[Number(n[i + 1])] + ' ';
                i++;
                sk = 1;
            } else if (n[i] != 0) {
                str += tw[n[i] - 2] + ' ';
                sk = 1;
            }
        } else if (n[i] != 0) {
            str += dg[n[i]] + ' ';
            if ((x - i) % 3 == 0) str += 'ratus ';
            sk = 1;
        }
        if ((x - i) % 3 == 1) {
            if (sk) str += th[(x - i - 1) / 3] + ' ';
            sk = 0;
        }
    }
    if (x != s.length) {
        var y = s.length;
        str += 'point ';
        for (var i = x + 1; i < y; i++) {
            str += dg[n[i]] + ' ';
        }
    }
    return str.replace(/\s+/g, ' ').replace("satu ratus", "seratus").replace("satu ribu", "seribu").replace("satu puluh", "sepuluh");
};

module.exports = numToWord;
});

require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map