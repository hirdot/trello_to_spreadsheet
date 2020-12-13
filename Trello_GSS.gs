var scriptProp =  PropertiesService.getScriptProperties().getProperties();
var TRELLO_KEY = scriptProp.API_KEY;
var TRELLO_TOKEN = scriptProp.API_TOKEN;
var BOARD_NAME = scriptProp.BOARD_TITLE;
var TRELLO_USER = scriptProp.USER_NAME;

var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var sheet_tasks = spreadsheet.getSheetByName('【記録】tasks');

var INFRA_MEMBERS = [];

var $board = '';
var $lists = '';
var $members = [];

function import_cards() {
  init_trello_vars();

  var list = '';
  var cards = '';
  var url = '';
  // 処理済みのリストを取得（多重インポート制御）
  var imported_weeks = get_imported_week_names();

  for (var _i in $lists) {
    // list has cards
    list = $lists[_i];
    if (list['name'].indexOf('週') < 0) continue;
    var week = list['name'].split('週')[0];
    if (imported_weeks.indexOf(week) >= 0) continue;

    url = 'https://api.trello.com/1/lists/' + list['id'] + '/cards?key=' + TRELLO_KEY + '&token=' + TRELLO_TOKEN
    cards = _get(url);

    var rows = [];
    var _r = sheet_tasks.getLastRow() + 1;
    var row = _r;
    for (var _c in cards) {
      // card
      var card = cards[_c];
      var card_id   = card['id'];
      var card_name = card['name'];
      var due = card['due'];
      due = (due == null) ? '' : due.split('T')[0].replace(/-/g,'/');

      // genre(business, category)
      var bc = b_c(card_name);
      var b = bc[0], c = bc[1];
      // points(estimated, consumed)
      var epcp = ep_cp(card_name);
      var ep = epcp[0], cp = epcp[1];

      // card has members
      for (var _m in card['idMembers']) {
        var member = $members[ card['idMembers'][_m] ];
        // 定義外のメンバーは除外する
        if (!member) continue;

        // 出力用セット（１行分）
        // 週, 担当, business, category, title, estimated, consumed
        rows.push(['=if(B@="","",left(B@,7))'.replace(/@/g, row), week, due, member, b, c, card_name, ep, cp, card_id]);
      }

      // 50行ずつ出力
      if (rows.length > 50) {
        sheet_tasks.getRange(_r, 1, rows.length, rows[0].length).setValues(rows);
        rows=[];
        _r = sheet_tasks.getLastRow() + 1;
      }

      row += 1;
    }

    // 残りがあれば出力
    if (rows.length > 0) {
      sheet_tasks.getRange(_r, 1, rows.length, rows[0].length).setValues(rows);
    }
  }

  // sort
  sort_task_sheet();
}

function sort_task_sheet(){
  // sort
  var range = sheet_tasks.getRange("A2:K" + sheet_tasks.getLastRow());
  range.sort([2,5,6,3,9]);
}

function get_imported_week_names() {
  var range = sheet_tasks.getRange("O2:O" + sheet_tasks.getLastRow());
  var vals = range.getValues();
  vals = column_array( vals, 0 );
  return vals;
}
