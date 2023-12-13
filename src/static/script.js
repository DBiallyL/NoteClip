class MusicComment {
    constructor(startTime, endTime, commentText) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.duration = endTime - startTime;
        this.commentText = commentText
    }

    addToPage() {

    }
}

class MusicBlock {
    constructor(youtubeID) {
        this.youtubeID = youtubeID
        this.comments = []
    }

    addComment(myFormData) {
        var startTime = (myFormData.get("startMinute")*60)
        startTime += myFormData.get("startSecond")
        var endTime = (myFormData.get("endMinute")*60)
        endTime += myFormData.get("endSecond")

        
        var commentText = myFormData.get("comment")

        var musicComment = new MusicComment(startTime, endTime, commentText)
        this.comments.push(musicComment) 

        return musicComment
    }
}

// -------------------------
// USED FOR CREATING A POST
// -------------------------

let textNum = 0
let musicNum = 0

let players = []
let playersTime = []

let musicBlocks = []

// Coded with help from: https://stackoverflow.com/questions/52229901/navigate-to-route-on-button-clickTODO 
// TODO CHANGE
function applyFunction(clickedButton, callback) {
    if (clickedButton != null) {
        clickedButton.onclick = callback;
    }
}

var loginButton = document.getElementById('loginButton');
applyFunction(loginButton, () => {
    location.assign("/login/good");
})

var newPostButton = document.getElementById('newPostButton');
applyFunction(newPostButton, () => {
    location.assign("/new");
})

var newAccountButton = document.getElementById('newAccount');
applyFunction(newAccountButton, () => {
    location.assign("/newAccount/good");
})

var logoutButton = document.getElementById('logout');
applyFunction(logoutButton, () => {
    location.assign("/logout");
})

var backButton = document.getElementById('backButton');
applyFunction(backButton, () => {
    location.assign("../");
})

// Coded with help from: https://stackoverflow.com/questions/178325/how-do-i-check-if-an-element-is-hidden-in-jquery
// Used when creating a new post, when a user clicks the add button
function clickAdd() {
    if ( $("#addChoice").css('display') == 'none') {
        $("#addChoice").show()
    }
    else {
        $("#addChoice").hide()
    }
}

// Coded with help from: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/search
// Used when creating a new post, when a user chooses to add a music block
function addMusic() {
    $("#addChoice").hide()
    var musicId = "music" + musicNum
    $("<div class='musicDiv' id=\"" + musicId + "\"><search><form id=\"songSearchForm\"><input id=\"search-" + musicId + "\" name=\"songSearch\" type=\"search\" placeholder=\"Search...\"</form><input class=\"formSubmit\" type=\"button\" value=\"Search\" onclick=\"doSearch('" + musicId + "')\"></search></div><br/>").insertBefore("#addDiv")
    musicNum++
}

// Used when creating a new post, when a user chooses to add a text block
function addText() {
    $("#addChoice").hide()
    var textId = "text" + textNum
    textNum++
    $("<p id=\"" + textId + "\" contenteditable data-placeholder=\"Start Typing...\"></p><br/>").insertBefore("#addDiv")
}

// will probably be helpful https://stackoverflow.com/questions/18169933/submit-form-without-reloading-page
// Used when creating a new post, when a user searches for a song
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

// Used when creating a new post, to finish adding a searched for song
function addSong(youtubeID, musicId) {    
    idNum = musicId.substring(5)
    exampleEmbed = "<div id=\"player-" + musicId + "\"></div><div class='commentsDiv'><p class='viewComments'>View Comments></p><br/><button type='button' id='button-" + musicId + "' class='commentButton' onclick='addComment(" + idNum + ")'>Add Comment</button></div>"
    $("#search-results").remove()
    $(exampleEmbed).insertAfter("search")
    $("search").remove()

    var player;
    player = new YT.Player('player-' + musicId, {
        height: '390',
        width: '640',
        videoId: youtubeID,
    });

    musicBlocks.push(new MusicBlock(youtubeID))
    players.push(player)
    playersTime.push(player.getCurrentTime())
}

function addComment(idNum) {
    // not sure why but it wont let me make the finish comment button an input.... (in or out of form!!!)
    // help from: https://ux.stackexchange.com/questions/112264/best-way-to-put-input-fields-that-take-minutes-and-seconds-mmss
    commentForm = "<div class='commentForm'><form id='commentForm" + idNum + "'><label>Start comment at: </label><input class='timeInput' type='number' min='0' max='59' placeholder='0' id='startMinute' name='startMinute'>:<input class='timeInput' type='number' min='0' max='59' placeholder='0' id='startSecond' name='startSecond'><br/><label>End comment at: </label><input class='timeInput' type='number' min='0' max='59' placeholder='0' id='endMinute' name='endMinute'>:<input class='timeInput' type='number' min='0' max='59' placeholder='0' id='endSecond' name='endSecond'><br/><textarea name='comment'></textarea><input type='submit' value='Finish Comment' class='formSubmit'></form></div>"
    $("#button-music" +idNum).hide()
    $(commentForm).insertBefore("#button-music"+idNum)
    $("#commentForm" + idNum).on("submit", (e) => finishComment(e, idNum))

    $(".timeInput").on("input", (e) => changeVidTime(e))
}

function changeVidTime(e) {
    if (e.target.name == 'startMinute' || e.target.name == 'startSecond') {
        playerNum = e.target.parentNode.id.substring(11)
        player = players[playerNum]
        newTime = ($("#startMinute").val()*60) + ($("#startSecond").val()*1)
        players[playerNum].seekTo(newTime, true)
    }
}

function finishComment(e, idNum) {
    e.preventDefault()

    myFormData = new FormData(e.target)
    musicComment = musicBlocks[idNum].addComment(myFormData)
    commentHTML = createCommentHTML(musicComment)
    $(commentHTML).insertBefore("#button-music" +idNum)

    player = players[idNum]
    $("#button-music" +idNum).show()
    $(".commentForm").remove()
}

function finishPost() {
    $("#finishDiv").show()
}

function closeFinishPost() {
    $("#finishDiv").hide()
}

// ---------------------------------
// USED FOR BOTH CREATING AND VIEWING A POST
// ---------------------------------

// Need this function to make sure youtube players work, on both creating new posts and viewing posts
function onYouTubeIframeAPIReady() {
    console.log("youtube ready")
}

function createCommentHTML(musicComment) {
    var commentHTML = "<div class='comment' onclick='viewComment(" + musicComment.startTime + ", " + musicComment.duration + ")'><p>" + musicComment.commentText + "</p></div>"
    return commentHTML
}

function submitPost(e) {
    e.preventDefault()


    myFormData = new FormData(e.target)

    // Removes post edit functionality before saving HTML
    $(".commentButton").remove()
    $("#addDiv").remove()
    $("#finishButton").remove()
    $("p").attr("contenteditable", "False") 

    articleContents = $("article").html()

    var postInfo = {"title": myFormData.get("title"), "summary": myFormData.get("description"), "htmlContent": articleContents}

    // Coded with help from: https://stackoverflow.com/questions/29987323/how-do-i-send-data-from-js-to-python-with-flask  
    $.post("/new/finish", postInfo, function() {
        console.log("success")
    })
}

function initCreatePost() {
    // make sure they are restarted on new load
    textNum = 0
    musicNum = 0

    players = []
    playersTime = []

    musicBlocks = []

    $("#finishForm").on("submit", (e) => submitPost(e));
}

// Wasn't working... not sure why
// $(document).ready(function() {
//     window.alert("DOC READY");
//     $("#finishForm").on("submit", (e) => submitPost(e));
// });