var express = require('express');
var router = express.Router();
const Schema = require('../models/Schema');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

//Object.getName()->typeofよりも詳細な型取得
Object.prototype.getName = function() { 
  var funcNameRegex = /function (.{1,})\(/;
  var results = (funcNameRegex).exec((this).constructor.toString());
  return (results && results.length > 1) ? results[1] : "";
};

//DB接続
mongoose.connect(process.env.databaseKey)
.then(() => {
  console.log("データベース接続完了");
})
.catch((err) => {
  console.log(`データベース接続エラー     ${err}`);
});

//アカウント登録処理
router.post('/register', async function(req, res, next) {
  //①電話番号を主キーに同じ物を登録しないように弾く
  //②データを登録する
  try {
    const record = await Schema.find({ phone_number: req.body.phone_number});
    if (record.length === 1) {
      console.log("登録時にレコードが存在していたので弾く");
      res.redirect('/register');
    } else {
      console.log("レコードが存在していないので登録する");
      console.log(req.body);
      console.log(`req.body.phone_number:${req.body.phone_number}`);
      console.log(`req.body.L-name:${req.body.L_name}`);
      //姓名統合が必要?
      //①姓名統合
      //②DB登録時のオブジェクトを作成する 
      const registerName = `${req.body.L_name} ${req.body.F_name}`;
      console.log(registerName);
      const registerObject = {
        phone_number: req.body.phone_number,
        password: req.body.password,
        name: registerName,
        department: req.body.department,
        is_admin: 0
      };
      const userData = await Schema.create(registerObject);
      //後で消す
      //Schema.createはasync function->中でPromiseオブジェクトが実行されているのでawait句を使う事でresolve()が呼ばれるまで実行を停止している？
      //Schema.createでresolve()が呼ばれているようには見えない,返ってきたreturnされた値がPromsiseオブジェクトでその中でresolve()が呼ばれている？
      console.log(Schema.create + "");
      res.cookie('phone_number', req.body.phone_number, {maxAge: 60000, httpOnly: false });
      res.redirect('/top');
    }
  } catch (err) {
    console.log(`データベース登録エラー   ${err}`);
    res.redirect('/register');
  }
});

//アカウントログイン処理
router.post('/login', async function(req, res, next) {
  //①アカウントの存在を確認する
  //○->メインページに遷移.×->ログインページにリダイレクトさせる
  console.log(`入力された電話番号:${req.body.phone_number} --- 入力されたパスワード${req.body.password}`);
  try {
    const record = await Schema.find({ phone_number: req.body.phone_number });
    //next()で実行出来るっぽい？
    // next();
    console.log(record);
    console.log(record.length);
    if(record.length === 1) {
      if(req.body.phone_number === record[0].phone_number && req.body.password === record[0].password) {
        console.log("ログイン処理成功");
        console.log(req.body);
        // res.cookie('phone_number', req.body.phone_number, {maxAge: 60000, httpOnly: false });
        res.redirect('/top');
      } else {
        console.log("elseに入った");
        console.log("ログイン処理失敗");
        res.redirect("/register");
      }
    } else {
      console.log("電話番号でレコードを取ってこれなかった");
      res.redirect("/register");
    }
  } catch(err) {
    console.log(`データベース取得エラー   ${err}`);
  }
});

module.exports = router;