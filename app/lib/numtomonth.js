function numToMonth(s) {
let MonthWord = '';
const Month =[
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
  ];
const sNum = parseFloat(s);
const MonthNumber = sNum-1;
MonthWord = Month[MonthNumber];
return MonthWord;
}

module.exports = numToMonth;
