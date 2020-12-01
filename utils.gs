function _get(url) {
  var options = { 'method' : 'get' };
  var response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response);
}

function _put(url) {
  var options = { 'method' : 'put' };
  var response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response);
}

function update_cost_value() {
  // アクティブなシート取得
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getActiveSheet();
  if(sheet.getName() != '【記録】tasks'){
    return 0;
  }

  var activerange = sheet.getActiveRange();
  var col = activerange.getColumn();
  var row = activerange.getRow();

  // business ～ consumed を直した時以外は無視
  if (col < 5 || 9 < col) return;
  // 1行目の修正は無視
  if (row == 1 ) return;
  // フラグ済みなら無視
  if(sheet.getRange(row, 11).getValue() == 1) return;

  // 反映フラグに1を入れる
  sheet.getRange(row, 11).setValue(1);
}

function column_array(arr_2d, col_name){
  var arr = [];
  for (var i = 0; i < arr_2d.length; i++) {
    arr[i] = arr_2d[i][col_name];
  }
  return arr;
}

