let textNum = 0
let musicNum = 0

let players = []
let playersTime = []

// Coded with help from: https://stackoverflow.com/questions/52229901/navigate-to-route-on-button-click
var loginButton = document.getElementById('loginButton');
loginButton.onclick = function() {
    location.assign("/login/good");
}

// var signupButton = document.getElementById('newAccount');
// signupButton.onclick = function() {
//     location.assign("/newAccount/good");
// }

// var backButton = document.getElementById('backButton');
// backButton.onclick = function() {
//     location.assign("../");
// }

var logoutButton = document.getElementById('logout');
logoutButton.onclick = function() {
    console.log("work");
    location.assign("/logout");
}

// Coded with help from: https://stackoverflow.com/questions/178325/how-do-i-check-if-an-element-is-hidden-in-jquery
function clickAdd() {
    if ( $("#addChoice").css('display') == 'none') {
        $("#addChoice").show()
    }
    else {
        $("#addChoice").hide()
    }
}

// Coded with help from: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/search
function addMusic() {
    $("#addChoice").hide()
    var musicId = "music" + musicNum
    $("<div id=\"" + musicId + "\"><search><form id=\"songSearchForm\"><input id=\"search-" + musicId + "\" name=\"songSearch\" type=\"search\" placeholder=\"Search...\"</form><input class=\"formSubmit\" type=\"button\" value=\"Search\" onclick=\"doSearch('" + musicId + "')\"></search></div><br/>").insertBefore("#addDiv")
    musicNum++
}

function addText() {
    $("#addChoice").hide()
    var textId = "text" + textNum
    textNum++
    $("<p id=\"" + textId + "\" contenteditable data-placeholder=\"Start Typing...\"></p><br/>").insertBefore("#addDiv")
}

// will probably be helpful https://stackoverflow.com/questions/18169933/submit-form-without-reloading-page
async function doSearch(musicId) {
    query = $("#search-" + musicId).val();

    let previousSearch = $("#search-results");
    if (previousSearch.length) {
        previousSearch.remove();
    }
    
    const response = await fetch("/search/" + query);
    const search_results = await response.json() // this returns a list of the top 5 search (as youtube id)

    $("<div id='search-results'></div>").insertAfter("search");

    for (key of Object.keys(search_results)) {
        let item = search_results[key];
        $("<div class='result-item'><p class='search-title'>" + item["snippet"]["title"] + "</p>" + "<p class='search-description'>" + item["snippet"]["description"] + "</p></br></div><button id=\"result-" + key + "\" class='addVideoButton' type='button'>Add</button>").appendTo("#search-results");
        $(("#result-" + key)).on("click", () => {
            addSong(item["id"]["videoId"], musicId)
        })
    }
}

function addSong(youtubeID, musicId) {    
    idNum = musicId.substring(5)
    exampleEmbed = "<div id=\"player-" + musicId + "\"></div><button type='button' id='button-" + musicId + "' class='commentButton' onclick='addComment(" + idNum + ")'>Add Comment</button>"
    $("#search-results").remove()
    $(exampleEmbed).insertAfter("search")
    $("search").remove()

    var player;
    player = new YT.Player('player-' + musicId, {
        height: '390',
        width: '640',
        videoId: youtubeID,
    });

    players.push(player)
    playersTime.push(player.getCurrentTime())
}

// // doesn't work within iframe of course. 
// function clickPage(){
//     // window.alert("Clicked!")
//     for (i = 0; i < players.length; i++) {
//         if (players[i].getPlayerState() == 2) {
//             if (playersTime[i] != players[i].getCurrentTime()) {
//                 window.alert("New time!")
//             } 
//         }
//     }
// }

function addComment(idNum) {
    // not sure why but it wont let me make the finish comment button an input.... (in or out of form!!!)
    // help from: https://ux.stackexchange.com/questions/112264/best-way-to-put-input-fields-that-take-minutes-and-seconds-mmss
    commentForm = "<div class='commentForm'><form id='commentForm" + idNum + "'><label>Start comment at: </label><input class='timeInput' type='number' min='0' max='59' placeholder='0' id='startMinute' name='startMinute'>:<input class='timeInput' type='number' min='0' max='59' placeholder='0' id='startSecond' name='startSecond'><br/><label>End comment at: </label><input class='timeInput' type='number' min='0' max='59' placeholder='0' id='endMinute' name='endMinute'>:<input class='timeInput' type='number' min='0' max='59' placeholder='0' id='endSecond' name='endSecond'><br/><textarea name='comment'></textarea></form><button class=\"formSubmit\" type=\"button\" onclick=\"finishComment('" + idNum + "')\">Finish Comment</button></div>"
    $("#button-music" +idNum).hide()
    $(commentForm).insertBefore("#button-music"+idNum)

    $(".timeInput").on("input", (e) => changeVidTime(e))
}

function changeVidTime(e) {
    if (e.target.name == 'startMinute' || e.target.name == 'startSecond') {
        playerNum = e.target.parentNode.id.substring(11)
        player = players[playerNum]
        newTime = ($("#startMinute").val()*60) + ($("#startSecond").val()*1)
        window.alert('min' + $("#startMinute").val() + 'sec' + $("#startSecond").val() + 'newtime' + newTime)
        players[playerNum].seekTo(newTime, true)
    }
}


function finishComment(idNum) {
    player = players[idNum]
    $("#button-music" +idNum).show()
    $(".commentForm").remove()
    // will need to get comment info and start of comment time
}

function onYouTubeIframeAPIReady() {
    console.log("youtube ready")
}

function finishPost() {
    $("#finishDiv").show()
}

function closeFinishPost() {
    $("#finishDiv").hide()
}