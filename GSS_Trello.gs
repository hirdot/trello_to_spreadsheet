function reflect_to_trello(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet_tasks = ss.getSheetByName('【記録】tasks');

  var b_col = 5;
  var c_col = 6;
  var es_col = 8;
  var con_col = 9;
  var name_col = 7;
  var id_col = 10;
  var edit_col = 11;

  var column_b = sheet_tasks.getRange(1, 2).getValue();
  var last_row = sheet_tasks.getRange(1, 2).getNextDataCell(SpreadsheetApp.Direction.DOWN).getRow();
//  var last_row = sheet_tasks.getLastRow();
  var limitter_75 = 1;
  var past_id = '';
  for (var row = 1; row <= last_row; row++) {
    var id = sheet_tasks.getRange(row, id_col).getValue();
    // フラグのない行はスキップ
    if (sheet_tasks.getRange(row, edit_col).getValue() != 1) continue;

    var name = sheet_tasks.getRange(row, name_col).getValue();
    var b = sheet_tasks.getRange(row, b_col).getValue();
    var c = sheet_tasks.getRange(row, c_col).getValue();
    var name_after = reinput_b_c(name,b,c);
//    if (name == name_after) continue;

    // タイトルに変更があれば反映
    sheet_tasks.getRange(row, name_col).setValue(name_after);

    // Trello に反映
    var url = 'https://api.trello.com/1/cards/@id?name=@name&key=@key&token=@token';
    url = url.replace('@id', id).replace('@name', name_after).replace('@key', TRELLO_KEY).replace('@token', TRELLO_TOKEN);
    var response = _put(url);
    sheet_tasks.getRange(row, edit_col).setValue(9);
    Utilities.sleep(300)
    past_id = id;

    if (limitter_75 >= 75) {
      var wait = 1000 * 15;
      Utilities.sleep(wait);
      Logger.log(row);
      limitter_75 = 1;
    } else {
      limitter_75++;
    }
  }

}

//triggerで走って変更があったcardの情報をTrelloへ送信
function onEdit_to_trello(event){
  var id_col = 8;
  var name_col = 5;
  var b_col = 3;
  var c_col = 4;

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet_tasks = spreadsheet.getSheetByName('【記録】tasks');
  var row    = event.range.getRow();
  var column = event.range.getColumn();
  var id = sheet_tasks.getRange(row, id_col).getValue();
  console.log(id);
  var queries = '';
  var name = sheet_tasks.getRange(row, name_col).getValue();
  var b = sheet_tasks.getRange(row, b_col).getValue();
  var c = sheet_tasks.getRange(row, c_col).getValue();

  var name_after = reinput_b_c(name,b,c);

  switch(column){
    case 3:
      queries = '?name=' + name_after;
      break;
    case 4:
      queries = '?name=' + name_after;
      break;
    default:
      console.log('I have no idea how to PUT this change to Trello...')
      return
  }

  var url = 'https://api.trello.com/1/cards/' + id + queries + '&key=' + TRELLO_KEY + '&token=' + TRELLO_TOKEN
  console.log(url)
  //var response = _put(url);
  //console.log(response);

}
