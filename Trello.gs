// set global vars
function init_trello_vars() {
  $board = trello_board();
  $lists = trello_done_lists();
  $members = trello_members();
  
  Logger.log($board);
  Logger.log($lists);
  Logger.log($members);
}

// trello board named with ''
function trello_board() {
  var url = 'https://api.trello.com/1/members/' + TRELLO_USER + '/boards?key=' + TRELLO_KEY + '&token=' + TRELLO_TOKEN + '&fields=name';
  var response = _get(url);

  for(var n in response){
    if(response[n]['name'] !== BOARD_NAME) continue;
    return response[n];
  }
}

// lists named with 'done'
function trello_done_lists() {
  // 'closed' mean 'archived lists'
  var url = 'https://api.trello.com/1/boards/' + $board['id'] + '/lists/closed?key=' + TRELLO_KEY + '&token=' + TRELLO_TOKEN + '&fields=name'
  var response = _get(url);
  var ret = [];

  for(var n in response) {
    if(response[n]['name'].indexOf('done') < 0) continue;
    ret.push(response[n]);
  }  
  return ret
}

function trello_members(){
  var url = 'https://api.trello.com/1/boards/' + $board['id'] + '/members?key=' + TRELLO_KEY + '&token=' + TRELLO_TOKEN;
  var response =  _get(url);
  var ret = {};

  var names = {TRELLO_USER: "表示名"};  // チームボードの場合ここにメンバーを登録する
  for (var i in response) {
    var m = response[i];
    ret[m['id']] = names[m['username']];
  }
  return ret;
}

// --------------------
// タイトルの操作
// --------------------
function b_c(card_name) {
  var b = '', c = '';

  if (card_name.indexOf('】') < 0) {
    Logger.log(card_name);
  }
  else {
    title = card_name.split('】')[0].split('【')[1].split('・');
    b = title[0], c = title[1] || '';
    c = c.indexOf('開発') < 0 ? c : '開発'
  }

  return [b,c]
}

// e.g. "【hoge・fuga】aaa","piyopiyo","バグ"
// =>   "【piyopiyo・バグ】aaa"
//      "【hoge】aaa","piyopiyo","バグ"
// =>   "【piyopiyo・バグ】aaa"
//      "aaa","piyopiyo","バグ"
// =>   "【piyopiyo・バグ】aaa"
function reinput_b_c(card_name,b,c){
  var subtitle = '';
  if(c=='')subtitle = "【"+b+"】";
  else subtitle = "【"+b+"・"+c+"】"
  
  var pos_term,pos_init
  switch(pos_term = card_name.indexOf('】')){
    case -1:
      return subtitle+card_name;
    default:
      pos_init = card_name.indexOf('【')
      var before = card_name.slice(pos_init,pos_term+1);
      return card_name.replace(before,subtitle)
  }
}

function ep_cp(card_name) {
  return[yotei_match(card_name), zitsu_match(card_name)]
}

function yotei_match(s){
  var arr = s.match(/\(\d+(\.\d+)?\)/) || ["(0)"]
  var str = arr[0];
  return str.slice(1,str.length-1);
}

function zitsu_match(s){
  var arr = s.match(/\[\d+(\.\d+)?\]/) || ["[0]"]
  var str = arr[0];
  return str.slice(1,str.length-1);
}
