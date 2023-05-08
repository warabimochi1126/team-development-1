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
router.get('/:department?', async function(req, res, next) {
  console.log(`debug:` + req.cookies.phone_number);
  if(req.cookies.phone_number === undefined) {
    console.log("loginしなかったのでredirectさせる");
    res.redirect('/login');
  }
  //SELECT name, department, state_left, state_mid, state_right FROM users;
  const getData = await Schema.find({},{name: 1, department: 1, state_left: 1, state_left: 1, state_mid: 1, state_right: 1, updatedAt: 1}).lean();
  //SELECT name FROM users WHERE phone_number = req.cookies.phone_number
  const loginUserData = await Schema.findOne({phone_number: req.cookies.phone_number}, {name: 1, state_left: 1}).lean();
  let loginUserName;
  if(req.cookies.phone_number != undefined) {
    loginUserName = loginUserData.name.slice(0, 1);
  } else {
    loginUserName = "エラー吐く用";
  }

  //pugに引き渡すためのオブジェクトを作成する
  //MongoDBから取得した値はmodelというデータ構造になっていて編集が出来ません
  //①取得したmodelをobjectに変換して編集出来るようにします->lean()でobjectとして取得出来ます
  //②pugに引き渡すため値を変換します
  for(let i = 0; i < getData.length; i++) {
    getData[i].names = getData[i].name.split(' ');
    getData[i].iconName = getData[i].names[0].slice(0, 1);
    if(Number(getData[i].department) === 1) {
      getData[i].department = '営業部';
    } else if (Number(getData[i].department) === 2) {
      getData[i].department = '企画部';
    } else if (Number(getData[i].department) === 3) {
      getData[i].department = '開発部';
    } else {
      getData[i].department = '認められない値が入力された場合';
    }
  }
  console.log(getData[0]);            //取得したobjectの一例
  console.log(getData[0].getName());
  console.log(req.cookies.phone_number);
  //req.params.deparmentはString
  console.log(req.params.department);

  let pugData = true;
  if(Number(req.params.department) === 1) {
    pugData = getData.filter((val) => {
      console.log(val.department);
      return val.department === '営業部';
    });
  } else if (Number(req.params.department) === 2) {
    pugData = getData.filter((val) => {
      console.log(val.department);
      return val.department === '企画部';
    });
  } else if (Number(req.params.department) === 3) {
    pugData = getData.filter((val) => {
      console.log(val.department);
      return val.department === '開発部';
    });
  } else if (Number(req.params.department) === 4) {
    pugData = getData.filter((val) => {
      return val.state_left === 'rgb(214, 0, 21)';
    });
  } else {
    pugData = getData;
  }
  console.log(loginUserData);

  let loginUserState;
  //エラー潰し用
  if(req.cookies.phone_number === undefined) {
    loginUserState = "エラー吐く用";
  } else {
    loginUserState = loginUserData.state_left;
  }
   //全体の安否状況に引き渡す値の作成
  //変換:#6eaa00->rgb(110, 170, 0).#d60015->rgb(214, 0, 21)
  let safeUser = 0;
  let dangerUser = 0; 
  let unconfirmedUser = 0; 
  let wholeUser = 0;
  for(let i = 0; i < pugData.length; i++) {
    if(pugData[i].state_left === 'rgb(110, 170, 0)') {
      safeUser++;
    } else if (pugData[i].state_left === 'rgb(214, 0, 21)') {
      dangerUser++;
    } else {
      unconfirmedUser++;
    }
    wholeUser++;
  }

  //最終投稿の時間とメイン画面を返した時間の差分を〇分前のようにpugに渡す
  //①レスポンスを返すタイミングの時刻とupdatedAtを取得
  //②取得したDateオブジェクトの差を取得
  //③取得した差をpugDataのプロパティに詰めてpugに渡す
  //差が60秒より小さければ〇秒前.60分より小さければ〇分前.24時間より小さければ〇時間前.7日より小さければも〇日前.それ以上大きければ1週間以上のような表示
  const currentTime = Math.floor(Date.now() / 1000);
  for(let i = 0; i < pugData.length; i++) {
    pugData[i].timeDiff = currentTime - Math.floor(pugData[i].updatedAt.getTime() / 1000);
    if (pugData[i].timeDiff < 60) {
      pugData[i].timeDiffPug = `${pugData[i].timeDiff}秒前`;
    } else if (pugData[i].timeDiff < 3600) {
      pugData[i].timeDiffPug = `${Math.floor(pugData[i].timeDiff / 60)}分前`;
    } else if (pugData[i].timeDiff < 86400) {
      pugData[i].timeDiffPug = `${Math.floor(pugData[i].timeDiff / 3600)}時間前`;
    } else if (pugData[i].timeDiff < 604800) {
      pugData[i].timeDiffPug = `${Math.floor(pugData[i].timeDiff / 86400)}日前`;
    } else {
      pugData[i].timeDiffPug = "1週間以上前";
    }
  }
  const reqUrl = req.url;
  res.render('top', {data: pugData, loginUserName, loginUserState, safeUser, dangerUser, unconfirmedUser, wholeUser, reqUrl});
});

module.exports = router;
