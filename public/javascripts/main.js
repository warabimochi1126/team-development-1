

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


  // アイコンの色を変えるためのJS
  const icon = document.getElementById('eyecon');
  // let count = 0;
  
  //iconのbackground-colorを取得する関数です
  function getBgColor() {
    return window.getComputedStyle(icon, null).getPropertyValue('background-color');
  }

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

    //-----frontend-------
    //変換:#6eaa00->rgb(110, 170, 0).#d60015->rgb(214, 0, 21)
    // if (count === 1) {
    //   icon.style.backgroundColor = 'rgb(110, 170, 0)';
    //   console.log(getBgColor());
    // } else if (count === 2) {
    //   icon.style.backgroundColor = 'rgb(214, 0, 21)';
    //   console.log(getBgColor());
    // } else if (count === 3) {
    //   icon.style.backgroundColor = 'rgb(110, 170, 0)';
    //   console.log(getBgColor());
    //   count = 1; // カウントをリセット
    // }
    //cookieを使ってログインユーザの確認
    console.log(document.cookie);
    //-----backend-----
    //色の更新順序:灰->緑->赤->緑->赤
    //メイン画面のアイコン・クリックするアイコンに対してDBから引っ張ってきたカラーコードを適用する
    //更新後のカラーコードをDBに保存でいける？
     //実際にサーバーにreqを送信する
     //TODO:05/01:19:50
     //①カラーコードを取得する
     //②postreqでAPI叩く
     //③サーバ側でpostでカラーコードをサーバ側cookieを使って保存(state_left代用してカラーコード入れとく)
     //④top,pugをレスポンスする時にDBに保存されているカラーコードを使ってリスト側のアイコン・クリックするアイコンの背景色を設定
     //動的にcssの変更が必要,サーバ側の値をクライアントJSにどうやって渡す？
     //pugの中にif書いて直接style当てて解決
     
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
    console.log("入力内容:" + document.textForm.comments.value);
    try {
      await axios.post("/api/v1/posting", {
        user: document.cookie,    //多分使わない
        content: document.textForm.comments.value
      });
    } catch (err) {
      console.log("content送信時によるpostreqエラー  " + err.response.data);
    }
  });