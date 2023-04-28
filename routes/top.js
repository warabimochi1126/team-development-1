var express = require('express');
var router = express.Router();
const Schema = require('../models/Schema');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const logPath = path.resolve(__dirname, '../logs/data.log');   //logsディレクトリを指す絶対パス
console.log(logPath);

//Object.getName()->typeofよりも詳細な型取得
Object.prototype.getName = function() { 
  var funcNameRegex = /function (.{1,})\(/;
  var results = (funcNameRegex).exec((this).constructor.toString());
  return (results && results.length > 1) ? results[1] : "";
};

mongoose.connect(process.env.databaseKey)
.then(() => {
  console.log("データベース接続完了 top");
})
.catch((err) => {
  console.log(`データベース接続失敗 top     ${err}`);
});
/* GET users listing. */
router.get('/', async function(req, res, next) {
  //SELECT name, department, state_left, state_mid, state_right FROM users;
  const getData = await Schema.find({},{name: 1, department: 1, state_left: 1, state_left: 1, state_mid: 1, state_right: 1}).lean();
  fs.writeFileSync(logPath, JSON.stringify(getData));
  //SELECT name FROM users WHERE phone_number = req.cookies.phone_number
  const loginUserData = await Schema.findOne({phone_number: req.cookies.phone_number}, {name: 1}).lean();
  const loginUserName = loginUserData.name.slice(0, 1);

  //pugに引き渡すためのオブジェクトを作成する
  //MongoDBから取得した値はmodelというデータ構造になっていて編集が出来ません
  //①取得したmodelをobjectに変換して編集出来るようにします->lean()でobjectとして取得出来ます
  //②pugに引き渡すため値を変換します
  for(let i = 0; i < getData.length; i++) {
    getData[i].names = getData[i].name.split(' ');
    getData[i].iconName = getData[i].names[0].slice(0, 1);
  }
  console.log(getData[0]);            //取得したobjectの一例
  console.log(getData[0].getName());
  console.log(req.cookies.phone_number);
  res.render('top', {data: getData, loginUserName});
});

module.exports = router;
