"use strict"

window.onload = function() {
    count_time();
}

function count_time() {
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();
    let date = now.getDate();
    let hour = now.getHours().toString().padStart(2,"0");
    let min = now.getMinutes().toString().padStart(2,"0");
    let output = `${year}/${month+1}/${date} ${hour}:${min}`;
    document.getElementById("time").textContent = output;

    setTimeout(count_time,1000);
}

function change_utc_to_js(utcTime)
{
    return(utcTime*1000);
}

function success(pos)
{
    ajaxRequest(pos.coords.latitude,pos.coords.longitude);
    //もし情報の習得に成功したら、ajaxRequest関数を呼び出している。
    //引数として取得した緯度と経度を渡している。
}

function fail (error){
    alert("位置情報の習得に失敗しました。エラーコード：" + error.code);
   //もし情報の習得に失敗したら、エラーコードを出力。その際、エラータイプも表示。
}

function ajaxRequest(lat,long) {
    const url = "https://api.openweathermap.org/data/2.5/forecast";   //api call
    const appId = "b735cae42c4a08f7cf59c143377f9cb8" ;    //ユーザー登録の時に取得したAPIのkey

    $.ajax({
        url: url,
        data: {
            appid: appId,
            lat : lat, //緯度
            lon : long, //経度
            units : "metric", //データの単位を設定。メートルとして習得。
            lang : "ja" //言語設定。日本語として習得。
        }
    })
    .done(function(data) {
        //data処理実装。
        //apiから帰ってきたデータを加工処理していく。
        $("#place").text(data.city.name + ", " + data.city.country);
        let currentDate = ""; //現在の日にちを入れるはこ
        $("#forecast").empty();
        let tableContainer = $("#forecast"); // これがテーブルを追加するためのコンテナ

        data.list.forEach(function(forecast,index){

            const dateTime = new Date(change_utc_to_js(forecast.dt));
            const month = dateTime.getMonth() + 1;
            const date = dateTime.getDate();

            const day_string = `${month}-${date}`;//現在の日にちを保持

            if(currentDate !== day_string) {
                currentDate = day_string;
                const newTable = $(`
                <table class="forecast-table">
                    <thead>
                        <tr>
                            <th colspan="8">${currentDate}</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>`);
                tableContainer.append(newTable);
            }
            const description = forecast.weather[0].description; //天気の説明を習得。３
            const temperature = Math.round(forecast.main.temp); //気温の習得。2
            const iconPath = `images/${forecast.weather[0].icon}.svg`;
            
            const hours = dateTime.getHours();
            const min = String(dateTime.getMinutes()).padStart(2, '0');

            if(index === 0) {
                const currentWeather = `
                <div class="icon"><img src="${iconPath}"></div>
                <div class="info">
                    <p>
                        <span class="description">現在の天気:${description}</span>
                        <span class="temp">${temperature}</span>℃
                    </p>
                </div> `;
                $("#weather").html(currentWeather);
            }
            else {
                const tableRow = `
                <tr>
                    <td class="info">
                        ${month}/${date} ${hours}:${min}
                    </td>
                    <td class="icon"><img src = "${iconPath}"></td>
                    <td><span class="description">"${description}"</span></td>
                    <td><span class="temp">${temperature}℃</span></td>
                </tr> `;
                // 最後のテーブルのtbodyに行を追加
                $(".forecast-table:last tbody").append(tableRow);
            }
        })

    })

    
    .fail(function(){
        //もしdataの習得に失敗したらfailedを出力。
        console.log("$.ajax failed!");
    })
}

navigator.geolocation.getCurrentPosition(success,fail); 
//geolocationオブジェクトを用いて現在地を習得。緯度、経度の情報。

/*
apiから返ってきた情報を習得する。JSONに含まれる各データはオブジェクトや配列のデータ読み取り方式を行う。
全ての情報のデータはlistプロパティに含まれており、今回は３時間おきのデータになっている。
１　日時はUTCフォーマットであるため、ミリ秒に変換して、月、日、時、分を取得する必要がある。
２　気温は小数第２まであるので四捨五入して整数に変換。
３　説明は特に加工なし。
４　データのアイコンはファイル名のみのため、<img>タグのsrc属性に指定できるようにパスを整形する必要がある。
*/
