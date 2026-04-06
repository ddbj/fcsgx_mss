// データのある範囲を調べる、getLastRow()が空せるでも検出してしまうことへの対策
function getLastRowByColumn(sheet, col) {
  var values = sheet.getRange(1, col, sheet.getMaxRows()).getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i][0] !== "") {
      return i + 1;  // 行番号に変換
    }
  }
  return 0;
}
// コンタミ無いときにはgsheetを移動
function moveFileWithDriveAPI(sheetid, formerparentid) {
  var fileId = sheetid;  // 移動したいファイルのID
  var targetFolderId = "1qZV8u0cLy-3qGT86Qanu9_jo993zUEvN"; // 移動先フォルダID

  // メタデータを更新して親フォルダを変更
  var metadata = {
    addParents: [targetFolderId],
    removeParents: [formerparentid]
  };
  // v3.ようの指定の仕方はこんな風 {}とnullの箇所は何も考えず固定 Files.update({}, fileid, null, metadata);
  Drive.Files.update({}, fileId, null, metadata);
}
// NSUB######.xlsxが存在するなら、xlsxをgsheet変換してxlsxをtrashします。
// gsheetにcontamiデータがあるかをしらべて適切なリンクをセルに記入します。
function putFCSlink() {
  offset = 3269;
  // MSSシート
  var ss = SpreadsheetApp.openById("15J_1-0j2CksstrDLJPjT9l0-QJs0UDx7b5h-crYparY").getSheetByName('submissions');
  //そのシートの最終行
  // var lrow = ss.getLastRow();
  var lrow = getLastRowByColumn(ss, 1);
  // 格納
  var nsubs = ss.getRange(offset, 1, lrow - offset + 1, 1).getValues();
  // Gdrive
  var folderid = "15E0yNLuRQdmW5bN6wDOxEoAzE-EuLyjH";
var files = DriveApp.getFolderById(folderid).getFiles();
while (files.hasNext()) {
  var file = files.next();
  var filename= file.getName();
  if (filename.toLowerCase().endsWith('.xlsx')) {
    var filebasename = filename.replace(/\.xlsx$/i, "");
    var fileid = file.getId();
    Logger.log(`${filename}` + ', ' + `${fileid}`);
    for (var row in nsubs) {     
      for (var col in nsubs[row]) {
        Logger.log('NSUB: ' + `${nsubs[row][col]}`);
        if (nsubs[row][col] == filebasename) {
          var destrow = Number(row) + offset;
          var cell = 'AG' + destrow;
          Logger.log('Koko-desu セル位置 = ' + cell);
          Logger.log(filename);
          //create Gsheet Drive v3用の書き方
          var option = {
          name: filebasename,
          mimeType: MimeType.GOOGLE_SHEETS,
          parents: [folderid]
          };
          // Drive v3用の変換
          var newgsheet = Drive.Files.create(option, file.getBlob());
          // セルに記入
          var newss = SpreadsheetApp.openById(newgsheet.id).getSheets()[0];
          var contami_in = newss.getRange('B2').getValue();
          if (contami_in === "" || contami_in === null) {
            Logger.log('コンタミ無し');
            cell = 'AF' + destrow;
            ss.getRange(cell).setValue('コンタミ無し w3const/fcslog/gx/' + filebasename + '/00fcs.sh');
            ss.getRange(cell).setFontColor(null);
            moveFileWithDriveAPI(newgsheet.id, folderid);
          } else {
            Logger.log('コンタミあるよ');
            ss.getRange(cell).setValue('https://docs.google.com/spreadsheets/d/' + newgsheet.id + '/view');
            cell = 'AF' + destrow;
            ss.getRange(cell).setValue('コンタミ有り w3const/fcslog/gx/' + filebasename + '/00fcs.sh');
            ss.getRange(cell).setFontColor("#ff0000");
          }
          file.setTrashed(true);
        }
      }
    }
  }
  }
}
