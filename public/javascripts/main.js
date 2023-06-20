//ドロップダウンの設定を関数でまとめる
function mediaQueriesWin(){
    const width = $(window).width();
    if(width <= 768) {//横幅が768px以下の場合
      $(".has-child>a").off('click'); //has-childクラスがついたaタグのonイベントを複数登録を避ける為offにして一旦初期状態へ
      $(".has-child>a").on('click', function() {    //has-childクラスがついたaタグをクリックしたら
        const parentElem =  $(this).parent();   // aタグから見た親要素の<li>を取得し
        $(parentElem).toggleClass('active');    //矢印方向を変えるためのクラス名を付与して
        $(parentElem).children('ul').stop().slideToggle(500);//liの子要素のスライドを開閉させる※数字が大きくなるほどゆっくり開く
        return false;//リンクの無効化
      });
    }else{//横幅が768px以上の場合
      $(".has-child>a").off('click');//has-childクラスがついたaタグのonイベントをoff(無効)にし
      $(".has-child").removeClass('active');//activeクラスを削除
      $('.has-child').children('ul').css("display","");//スライドトグルで動作したdisplayも無効化にする
    }
  }

  // ページがリサイズされたら動かしたい場合の記述
$(window).resize(function() {
    mediaQueriesWin();/* ドロップダウンの関数を呼ぶ*/
  });
  
  // ページが読み込まれたらすぐに動かしたい場合の記述
  $(window).on('load',function(){
    mediaQueriesWin();/* ドロップダウンの関数を呼ぶ*/
  });

  //jqueryを使うとObjectのprototypeを追加出来ないらしいです
  // Object.prototype.getName = function() { 
  //   var funcNameRegex = /function (.{1,})\(/;
  //   var results = (funcNameRegex).exec((this).constructor.toString());
  //   return (results && results.length > 1) ? results[1] : "";
  // };
  
  // アイコンの色を変えるためのJS
  const icon = document.getElementById('eyecon');
  // let count = 0;
  
  //iconのbackground-colorを取得する関数です
  function getBgColor() {
    return window.getComputedStyle(icon, null).getPropertyValue('background-color');
  }

  //ajaxもどきの実装
  const icons = document.getElementsByClassName('icon');
  const commentTexts = document.getElementsByClassName('commentText');
  const safe = document.getElementById('safe');
  const whole = document.getElementById('whole');
  const dantxt = document.getElementById('dan-txt');
  const unctxt = document.getElementById('unc-txt');

  const currentPath = location.pathname;
  console.log(`currentPath---${currentPath}`);
  //5秒に1回状態アイコン・コメントを更新する
  //①getreqすると最新の状態がJSONで返ってくるAPIを作る
  //②JSONを元にiconsとcommentTextsの内容を更新
  //③5秒に1回繰り返して実行させる
  const autoReload = async () => {
    try {
      //topのpathを使って取得したデータのどれを使うかを選択します
      let reWriteData;
      const latestData = await axios.get("/api/v1/reload");
      if(currentPath === "/top/1") {
        reWriteData = latestData.data.filter((val) => {
          return val.department === '1';
        })
      } else if(currentPath === "/top/2") {
        reWriteData = latestData.data.filter((val) => {
          return val.department === '2';
        })
      } else if(currentPath === "/top/3") {
        reWriteData = latestData.data.filter((val) => {
          return val.department === '3';
        })
      } else if(currentPath === "/top/4") {
        reWriteData = latestData.data.filter((val) => {
          return val.state_left === 'rgb(214, 0, 21)';
        })
      } else {
        reWriteData = latestData.data;
      }
      let safeUser = 0;
      let dangerUser = 0;
      let unconfirmedUser = 0;
      for(let i = 0; i < reWriteData.length; i++) {
        if(reWriteData[i].state_left === "rgb(110, 170, 0)") {
          safeUser++;
        } else if(reWriteData[i].state_left === "rgb(214, 0, 21)") {
          dangerUser++;
        } else {
          unconfirmedUser++;
        }
      }
      const wholeUser = safeUser + dangerUser + unconfirmedUser;
      safe.textContent = safeUser;
      whole.textContent = wholeUser;
      dantxt.textContent = dangerUser;
      unctxt.textContent = unconfirmedUser;

      //中身が入っていない項目を取得しようとするとundefinedが代入されます
      //対処:取得したJSONから背景色がundefinedの場合->灰色のカラーコード.コメントがundefinedの場合->指定された任意の文字列を代入
      for(let i = 0; i < reWriteData.length; i++) {
        if(reWriteData[i].state_left === undefined) {
          reWriteData[i].state_left = 'rgb(197, 197, 197)';
        }
        if(reWriteData[i].state_mid === undefined) {
          reWriteData[i].state_mid = "設定されていません";
        }
        icons[i].style.backgroundColor = reWriteData[i].state_left;
        commentTexts[i].textContent = reWriteData[i].state_mid;
      }
    } catch (err) {
      console.log(`reloadevent err  ${err}`);
    }
  }
  setInterval(autoReload, 1000);

  eyecon.addEventListener('mousedown', async function() {
    let currentBgColor = getBgColor();
    const green = 'rgb(110, 170, 0)';
    const red = "rgb(214, 0, 21)";
    //-----frontend書き換え-----
    if(currentBgColor === green) {
      icon.style.backgroundColor = red;
    } else {
      icon.style.backgroundColor = green;
    }
    //-----backend-----
     const currrentBgColor =  window.getComputedStyle(icon, null).getPropertyValue('background-color');
     try {
      await axios.post("/api/v1/update", {
        user: document.cookie,                //一応送っとくけど多分使わん
        currentColorCode: currrentBgColor
      });
     } catch (error) {
      console.log("アイコンクリックによるpostreqエラー  " + error.response.data);
     }
  });

  //-----backend-----
  //本文送信用
  //TODO:23/05/02
  const submitBtn = document.getElementById('upload');
  submitBtn.addEventListener('click', async () => {
    try {
      await axios.post("/api/v1/posting", {
        user: document.cookie,    //多分使わない
        content: document.textForm.comments.value
      });
    } catch (err) {
      console.log("content送信時によるpostreqエラー  " + err.response.data);
    }
  });