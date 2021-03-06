var myPage = document.getElementById("my_page");
myPage.addEventListener("click", my_page);
var reservation = document.getElementById("reservation");
reservation.addEventListener("click", reservation_);
var _login = document.getElementById("login");
var _logout = document.getElementById("logout");
_login.addEventListener("click", login_);
_logout.addEventListener("click", logout_);
let reservation_infos = [];
var search_ = document.getElementById("category_search");
var title_ = document.getElementById("category_input");
var yy_ = document.getElementById("yy");
var mm_ = document.getElementById("mm");
var dd_ = document.getElementById("dd");
var select = search_.addEventListener("click", search);

function search() {
  let db_mid;
  let db_title;
  let db_open_day;
  let db_director;
  let db_actors = [];
  let actors = [];
  let db_ticketing_infoR = [];
  let db_ticketing_infoRR = []; //예매자 수를 누적하여 mid 별로 담을 배열
  let db_ticketing_infoW = []; //이미 본 수를 담을 배열
  let db_length;
  let db_rating;
  let db_mids = [];
  let db_actor;
  let db_sids = new Array(); //해당 영화의 스케쥴 id값들.
  let data_length; //검색 후 나온 영화 결과값 갯수.
  var title = title_.value;
  var yy = Number(yy_.value);
  var mm = Number(mm_.value);
  var dd = Number(dd_.value);
  let movieText; //영화 & 배우 정보를 담을 배열
  let scheduleText; //스케쥴 을 담을 배열.
  let ticketingText; //티켓팅 내역을 담을 배열.
  let movieInfos = [];
  console.log(db_ticketing_infoRR);
  console.log(db_ticketing_infoW);
  // console.log(title)
  if (title != "" && yy != "" && mm != "" && dd != "") {
    $("tbody").empty(); //검색 시작시 메인 테이블 초기화.
    $.ajax({
      url: "../php/main.php",
      type: "GET",
      data: {
        keyword: title, //어떤 영화인지 전달.
        async: false,
        type: "movie_actor", //영화 정보와, 출연자 데이터 받음.
      },
      success: function (res) {
        console.log(res);
        if (res == "") {
          console.log("NULL");
          alert(`검색결과가 없습니다.`);
        } else {
          //넘어온 데이터가 있다면,
          let text = JSON.parse(res);
          movieText = text; //movieText에 넘어온 데이터를 배열로 바꿔 저장.
          console.log(text);
          data_length = text.length;
          let be_mid = text[0].MID;
          //영화의 mid값 별로 배우들 정보를 저장 하기 위해
          //mid값이 바뀔때 받아온 배우들을 mid별로 인덱스에 저장한다.
          db_mids.push(be_mid);
          for (let i = 0; i < data_length; i++) {
            db_mid = text[i].MID;
            if (be_mid != db_mid) {
              db_actors[be_mid] = actors;
              actors = [];
              be_mid = db_mid;
              db_mids.push(db_mid); //
            }
            db_title = text[i].TITLE;
            db_open_day = text[i].OPEN_DAY;
            db_director = text[i].DIRECTOR;
            db_length = text[i].LENGTH;
            db_rating = text[i].RATING;
            db_actor = text[i].AC_NAME;
            actors.push(db_actor); //actor정보들을 담는 actors배열에 actor를 저장한다.
            // db_actors.push(db_actor);
          }
          db_actors[db_mid] = actors; //mid별로 관리된 actor목록 배열이다.
          actors = [];
          be_mid = db_mid;
          // 2번째 ajax
          $.ajax({
            url: "../php/main.php",
            type: "GET",
            data: {
              keyword: title,
              type: "schedule", //영화mid 별로스케쥴 데이터를 얻음.
              mid: db_mids,
              async: false,
            },
            success: function (res) {
              console.log(res);

              let text = JSON.parse(res);
              scheduleText = text; //받아온 스케쥴 데이터 를 배열로 바꿔 저장.
              console.log(text);
              let len = text.length;
              for (let i = 0; i < len; i++) {
                db_sids[i] = text[i].SID; //받아온 sid들을 순서대로 저장.
              }
              console.log(db_sids);
              console.log(typeof db_sids);

              // 3번째 ajax
              $.ajax({
                url: "../php/main.php",
                type: "GET",
                data: {
                  keyword: title,
                  type: "ticketing", //티켓팅 데이터를 얻음.
                  sids: db_sids,
                  async: false,
                },
                success: function (res) {
                  if (res == "") {
                    alert(`데이터 없음.`);
                  }

                  let text = JSON.parse(res);
                  ticketingText = text;

                  //초기화 과정

                  for (let i = 0; i < movieText.length; i++) {
                    // let cid = Number(text[i].CID);
                    //mid별로 관리
                    db_ticketing_infoRR[movieText[i].MID] = 0;
                    db_ticketing_infoW[movieText[i].MID] = 0;
                  }

                  let mid_sid = [];
                  //영화의 mid별로 sid에 해당하는 티켓팅 내역을 정리하기 위한 for문이다.
                  for (let q = 0; q < db_mids.length; q++) {
                    let mid = Number(db_mids[q]);
                    console.log(`mid : ${mid}`);
                    for (let i = 0; i < movieText.length; i++) {
                      //영화 별 mid값으로 영화 데이터 파싱.
                      movieInfos[movieText[i].MID] = movieText[i];
                      mid_sid[mid] = 0;
                    }
                    console.log(ticketingText.length);
                    for (let i = 0; i < scheduleText.length; i++) {
                      let sid = Number(scheduleText[i].SID);
                      console.log(`sid : ${sid}`);
                      //이중포문으로, sid별 티켓팅 내역 배열을 조회하게 한다.
                      for (let j = 0; j < ticketingText.length; j++) {
                        let status = ticketingText[j].STATUS;
                        console.log(status);
                        if (
                          //현제 조회하는 스케쥴의 mid값과 현재 조회하는 영화의 mid값이 일치하면,
                          // 이 영화의 스케줄 인 것 이고,
                          //sid와 티켓팅의 sid가 같다면,
                          // 결국 현재 조회하는 영화의 스케쥴들의 티켓팅 내역이다.
                          Number(scheduleText[i].MID) == Number(mid) &&
                          Number(sid) == Number(ticketingText[j].SID)
                        ) {
                          //동일 영화 동일 스케쥴
                          let cnt = 0;
                          if (status == "r") {
                            //'r' 예약 상태이면 예매자 수를 카운팅하여 누적합 한다.
                            console.log(
                              ticketingText[j].TICKETING_ID + "###########"
                            );
                            cnt += Number(ticketingText[j].SEATS);
                            db_ticketing_infoRR[mid] += Number(
                              ticketingText[j].SEATS
                            );
                          }
                          if (status == "w") {
                            db_ticketing_infoW[mid] += Number(
                              ticketingText[j].SEATS
                            );
                          }
                          console.log(`cnt : ${cnt}`);
                        }
                      }
                    }
                    //영화 mid별로.

                    let d1 = new Date(2000 + yy, mm, dd); //사용자 입력 예매 날짜
                    let openDay = movieText[q].OPEN_DAY; //현재 조회하고 있는 영화의 개봉 날짜이다.
                    for (let k = 0; k < movieText.length; k++) {
                      if (Number(movieText[k].MID) == Number(mid)) {
                        openDay = movieText[k].OPEN_DAY;
                        break;
                      }
                    }
                    console.log(openDay);
                    let day = openDay.split("/");
                    console.log(day);
                    let db_yy = Number(day[0]);
                    let db_mm = Number(day[1]);
                    let db_dd = Number(day[2]);

                    let d2 = new Date(2000 + db_yy, db_mm, db_dd); //db영화 개봉일.
                    console.log(d1);
                    console.log(d2);
                    console.log(d1 < d2);
                    console.log(d1 - d2);
                    console.log(d1.getTime() - d2.getTime());
                    const diffDate = d1.getTime() - d2.getTime();

                    const dateDays = Math.abs(diffDate / (1000 * 3600 * 24));

                    console.log(dateDays);
                    console.log(db_open_day);
                    console.log(mid);

                    console.log(db_actors);
                    console.log(typeof db_actors);
                    console.log(db_actors[mid]);

                    if (d1 < d2) {
                      //예매 일이 더 크다
                      //개봉 예정임.
                      console.log(movieInfos[mid].TITLE);
                      //테이블 형태로 영화 정보를 보여준다.
                      $(`#tbody`).append(`<tr>
                                                <td>${movieInfos[mid].TITLE}</td>
                                                <td>${openDay}</td>
                                                
                                                <td>${movieInfos[mid].DIRECTOR}</td>
                                                <td>${db_actors[mid]}</td>
                                                <td>${movieInfos[mid].LENGTH}</td>
                                                <td>${movieInfos[mid].RATING}</td>
                                                <td>${db_ticketing_infoRR[mid]}</td>
                                                <td>${db_ticketing_infoW[mid]}</td>
                                                <td><input class = "check" disabled="true" type="checkbox"></td>
                                                
                                                <tr>`);
                    } else {
                      //상영 중임.
                      $(`#tbody`).append(`<tr>
                      <td>${movieInfos[mid].TITLE}</td>
                      <td>${openDay}</td>
                      
                      <td>${movieInfos[mid].DIRECTOR}</td>
                      <td>${db_actors[mid]}</td>
                      <td>${movieInfos[mid].LENGTH}</td>
                      <td>${movieInfos[mid].RATING}</td>
                      <td>${db_ticketing_infoRR[mid]}</td>
                      <td>${db_ticketing_infoW[mid]}</td>
                                                <td><input class="check"  type="checkbox"></td>
                                                
                                                <tr>`);
                    }
                  }
                  //선택박스가 클릭될때 이벤트이다.
                  $(`.check`).on("click", function () {
                    let temp = [];
                    let title = $(this)
                      .parent()
                      .parent()
                      .children()
                      .eq(0)
                      .text();
                    let open = $(this)
                      .parent()
                      .parent()
                      .children()
                      .eq(1)
                      .text();
                    let director = $(this)
                      .parent()
                      .parent()
                      .children()
                      .eq(2)
                      .text();
                    let actors = $(this)
                      .parent()
                      .parent()
                      .children()
                      .eq(3)
                      .text();
                    let runnigTime = $(this)
                      .parent()
                      .parent()
                      .children()
                      .eq(4)
                      .text();
                    let rating = $(this)
                      .parent()
                      .parent()
                      .children()
                      .eq(5)
                      .text();

                    let tid = $(this).parent().parent().children().eq(3)[0].id; //해당 row 의ticketing id값.
                    tid = Number(tid);
                    let flag = $(this)
                      .parent()
                      .parent()
                      .children()
                      .find('input[type="checkbox"]')
                      .is(":checked"); //해당 row 의ticketing id값.
                    console.log(typeof tid);
                    console.log(flag);
                    console.log(temp);

                    if (flag == true) {
                      temp.push(title);
                      temp.push(open);
                      temp.push(director);
                      temp.push(actors);
                      temp.push(runnigTime);
                      temp.push(rating);
                      temp.push("#");
                      reservation_infos.push(temp);
                      console.log(reservation_infos);
                      console.log(
                        $(this).parent().parent().children().eq(1).text()
                      );
                    } else {
                    }
                  });
                  console.log(db_ticketing_infoR);
                  console.log(db_ticketing_infoW);
                  let sids = [];
                },
                error: function (e) {
                  console.log(e);
                },
              });
              //
            },
            error: function (e) {
              console.log(e);
            },
          });
          //
        }
      },
      error: function (e) {
        console.log(e);
      },
    });
  } else {
    alert("제목 과 날짜를 입력해주세요");
  }
}
init();

//

function init() {
  let login_bool = sessionStorage.getItem("login");
  let login_id = sessionStorage.getItem("id");
  console.log("init");
  console.log(login_bool);
  if (login_bool == "true") {
    console.log("hide");

    $(`#login`).hide();
    $(`#logout`).show();
  } else {
    $(`#login`).show();

    $(`#logout`).hide();
  }
}
function logout_() {
  sessionStorage.setItem("login", "false");
  sessionStorage.setItem("id", 0);
  location.reload();
}
function login_() {
  //asdasdd
  open("../html/login.html", "_self");
}

function my_page() {
  open("../html/myPage.html", "_self");
}

function reservation_() {
  //관람 등급과 회원의 만나이 계산.
  //개봉일에 따라 상영중, 상영예정 갈림
  sessionStorage.setItem("reservation", reservation_infos);

  open("../html/reservation.html", "_self");
}
