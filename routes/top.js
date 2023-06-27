var express = require('express');
var router = express.Router();
const Schema = require('../models/Schema');
const mongoose = require('mongoose');

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
  if(req.cookies.phone_number === undefined) {
    res.redirect('/login');
  }

  const getData = await Schema.find({},{name: 1, department: 1, state_left: 1, state_left: 1, state_mid: 1, state_right: 1, updatedAt: 1}).lean();
  const loginUserData = await Schema.findOne({phone_number: req.cookies.phone_number}, {name: 1, state_left: 1}).lean();
  let loginUserName;
  try {
    if(req.cookies.phone_number != undefined) {
      loginUserName = loginUserData.name.slice(0, 1);
    } else {
      loginUserName = "エラー吐く用";
    }
  } catch(err) {
    console.log("エラー吐いた");
  }
  
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

  let pugData = true;
  if(Number(req.params.department) === 1) {
    pugData = getData.filter((val) => {
      return val.department === '営業部';
    });
  } else if (Number(req.params.department) === 2) {
    pugData = getData.filter((val) => {
      return val.department === '企画部';
    });
  } else if (Number(req.params.department) === 3) {
    pugData = getData.filter((val) => {
      return val.department === '開発部';
    });
  } else if (Number(req.params.department) === 4) {
    pugData = getData.filter((val) => {
      return val.state_left === 'rgb(214, 0, 21)';
    });
  } else {
    pugData = getData;
  }

  let loginUserState;
  //エラー潰し用
  if(req.cookies.phone_number === undefined) {
    loginUserState = "エラー吐く用";
  } else {
    loginUserState = loginUserData.state_left;
  }

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
