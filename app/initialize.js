document.addEventListener('DOMContentLoaded', () => {
  // do your setup here

  // var IMask = require('imask');
  var numToWord = require('./lib/numtoword.js');
  var numToMonth = require('./lib/numtomonth.js')

  // *************************
  //  Templates
  // *************************

  var notarisKomparisi = "{!kelamin} {!namaLengkap}, lahir di {!kotaLahir}, pada tanggal {!numTanggalLahir}-{!numBulanLahir}-{!numTahunLahir} ({!lahirWord}), {!pekerjaan}, Warga Negara Indonesia, Pemegang Kartu Tanda Penduduk dengan Nomor Induk Kependudukan {!noKTP}, bertempat tinggal di {!alamat}, Rukun Tetangga {!RT}, Rukun Warga {!RW}, Kelurahan/Desa {!kelurahan}, Kecamatan {!kecamatan}, {!kotaTinggal}.";

  var ppatKomparisi = "{!kelamin} {!namaLengkap}, lahir di {!kotaLahir}, pada tanggal {!numTanggalLahir} ({!dayBornWord}) bulan {!monthBornWord} tahun {!numTahunLahir} ({!yearBornWord}), {!pekerjaan}, Warga Negara Indonesia, Pemegang Kartu Tanda Penduduk dengan Nomor Induk Kependudukan {!noKTP}, bertempat tinggal di {!kotaTinggal}, {!alamat}, Rukun Tetangga {!RT}, Rukun Warga {!RW}, Kelurahan/Desa {!kelurahan}, Kecamatan {!kecamatan}.";

  // *************************
  //  INPUT MASKING
  // *************************

  function inputNumeric(Input) {
    Input.addEventListener('keypress', function(e){
      if(e.charCode < 48 || e.charCode > 57) {
        e.preventDefault();
        //console.log(e);
      }
    }, false)
  }

  var NumericInputs = document.querySelectorAll('.numericinput');
  for (var i = 0; i < NumericInputs.length; i++) {
    inputNumeric(NumericInputs[i])
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

  function getNameTitle (martialstatus, gender) {
    if(gender === "male") {
      return "Tuan"
    } else if (gender == "female" && martialstatus !== "single") {
      return "Nyonya"
    } return "Nona"
  };


  // Parsing PPAT MODE
  function ppatParsing(Form) {
    var ktpValues = getFormValue(Form);
    var ktpBornDayWord = numToWord(ktpValues.bornday);
    var ktpBornMonthWord = numToMonth(ktpValues.bornmonth);
    var ktpBornYearWord = numToWord(ktpValues.bornyear);
    var birthdayWord = ktpBornDayWord+' '+ktpBornMonthWord+' '+ktpBornYearWord;
    var fullNameCaps = ktpValues.fullname.toUpperCase();
    var nameTitle = getNameTitle(ktpValues.martialstatus, ktpValues.gender);
    var ppatKomparisiResults = ppatKomparisi
      .replace("{!kelamin}", nameTitle)
      .replace("{!namaLengkap}", fullNameCaps)
      .replace("{!kotaLahir}", ktpValues.bornplace)
      .replace("{!numTanggalLahir}", ktpValues.bornday)
      .replace("{!dayBornWord}", ktpBornDayWord)
      .replace("{!monthBornWord}", ktpBornMonthWord)
      .replace("{!numTahunLahir}", ktpValues.bornyear)
      .replace("{!yearBornWord}", ktpBornYearWord)
      .replace("{!pekerjaan}", ktpValues.jobs)
      .replace("{!noKTP}", ktpValues.nik)
      .replace("{!kotaTinggal}", ktpValues.city)
      .replace("{!alamat}", ktpValues.address)
      .replace("{!RT}", ktpValues.rt)
      .replace("{!RW}", ktpValues.rw)
      .replace("{!kelurahan}", ktpValues.kelurahan)
      .replace("{!kecamatan}", ktpValues.kecamatan);
    // Result
    return ppatKomparisiResults;
  }

  // Parsing Notaris MODE
  function notarisParsing(Form) {
    var ktpValues = getFormValue(Form);
    var ktpBornDayWord = numToWord(ktpValues.bornday);
    var ktpBornMonthWord = numToMonth(ktpValues.bornmonth);
    var ktpBornYearWord = numToWord(ktpValues.bornyear);
    var birthdayWord = ktpBornDayWord+' '+ktpBornMonthWord+' '+ktpBornYearWord;
    var fullNameCaps = ktpValues.fullname.toUpperCase();
    var nameTitle = getNameTitle(ktpValues.martialstatus, ktpValues.gender);
    var notarisKomparisiResults = notarisKomparisi
      .replace("{!kelamin}", nameTitle)
      .replace("{!namaLengkap}", fullNameCaps)
      .replace("{!kotaLahir}", ktpValues.bornplace)
      .replace("{!numTanggalLahir}", ktpValues.bornday)
      .replace("{!numBulanLahir}", ktpValues.bornmonth)
      .replace("{!numTahunLahir}", ktpValues.bornyear)
      .replace("{!lahirWord}", birthdayWord)
      .replace("{!pekerjaan}", ktpValues.jobs)
      .replace("{!noKTP}", ktpValues.nik)
      .replace("{!kotaTinggal}", ktpValues.city)
      .replace("{!alamat}", ktpValues.address)
      .replace("{!RT}", ktpValues.rt)
      .replace("{!RW}", ktpValues.rw)
      .replace("{!kelurahan}", ktpValues.kelurahan)
      .replace("{!kecamatan}", ktpValues.kecamatan);
    // Result
    return notarisKomparisiResults;
  }


  function submitForm() {
    var submitButton = document.querySelector('#submitButton');
    var resultTypeRadio = document.querySelector('input[name="resulttype"]');
    // Submit
    submitButton.addEventListener('click', function(e) {
      e.preventDefault();
      if (resultTypeRadio.checked) {
        var Result = notarisParsing('#ktpform');
        ResultBox.innerHTML = Result;
      } else {
        var Result = ppatParsing('#ktpform');
        ResultBox.innerHTML = Result;
      }


      console.log(resultTypeRadio.checked);
    },false)
  }

  submitForm();




  console.log('Initialized app');
});
