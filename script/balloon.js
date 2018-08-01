
    var POP_IMAGE = "res/pop.png";
    var POP_AUDIO = "res/pop.mp3";
    var DEATH_BALLOON = "res/b6.png";
    var MORE_TIME_BALLOON = "res/b7.png";
    var MAX_SPEED = 3;
    var MAX_BALLOONS = 6;

    var points = {
        "b0": 1, "b1": 2, "b2": 3,
        "b3": 4, "b4": 5, "b5": -1
    };

    var balloonWorkers = new Array();
    var workerStates = new Array();
    var balloonSpeeds = new Array();

    var gameover = false;

    function init(restart) {
        try {

        gameover = false;

        if (!restart) {

            window.addEventListener("touchstart", function (event) {
                if (event.target.tagName === "HTML" || event.target.tagName === "BODY") {
                    event.preventDefault();
                }
            }, false);
            window.addEventListener("scroll", function () { window.scrollTo(0, 0); }, false);

            var blob = new Blob(["var x = 0;var interval = setInterval(function () {postMessage(x);x++;}, 20);"], { type: 'application/javascript' });
            var backgroundWorker = new Worker(URL.createObjectURL(blob)); 
            backgroundWorker.onmessage = function (event) {
                document.getElementById("background")
                    .style.backgroundPosition = event.data + "px";
            };

            for (var j = 0; j < MAX_BALLOONS; j++) {
                workerStates.push(0);
                balloonSpeeds.push(0);
                balloonWorkers.push(null);
            }
        }

        document.getElementById("time").innerHTML = 60;
        document.getElementById("score").innerHTML = 0;

        for (var i = 0; i < 6; i++) {
            document.getElementById("b" + i).style.backgroundImage = "url(res/b" + i + ".png)";
            document.getElementById("b" + i).style.position = "absolute";
            document.getElementById("b" + i).style.bottom = "-260px";
            document.getElementById("t" + i).style.bottom = "-360px";
        }

        document.getElementById("gameover").style.visibility = "hidden";
        document.getElementById("restart").style.visibility = "hidden";
        document.getElementById("score-label").style.visibility = "visible";
        document.getElementById("score").style.visibility = "visible";
        document.getElementById("time-label").style.visibility = "visible";
        document.getElementById("time").style.visibility = "visible";
        document.getElementById("highscores").style.visibility = "hidden";
        document.getElementById("highscores-restart").style.visibility = "hidden";

            var balloon = 0;

            var interval = setInterval(function () {
                try {
                    if (workerStates[balloon] === 0 && document.getElementById("time").innerHTML > 0) {
                        var blob = new Blob(["onmessage = function(event) {" +
                            "var moveLeft = false;" +
                            "var x = event.data.x;" +
                            "var y = -200;" +
                            "var interval = setInterval(function () {" +
                            "   if (moveLeft) {" +
                            "      x = x - 0;" +
                            " } else {" +
                            "    x = x + 0;" +
                            "}" +
                            "if (x >= event.data.limit) {" +
                            "   moveLeft = true;" +
                            " } else if (x <= event.data.x) {" +
                            "    moveLeft = false;" +
                            "}" +
                            "y = y + 0.5;" +
                            "postMessage({ \"b\": event.data.b, \"x\": x, \"y\": y });" +
                            "}, event.data.maxspeed);" +
                            "};"], { type: 'application/javascript' });
                        balloonWorkers[balloon] = new Worker(URL.createObjectURL(blob));
                        //balloonWorkers[balloon] = new Worker("balloon.js");
                        var type = Math.floor(Math.random() * 20);
                        if (type === 1) {
                            document.getElementById("b" + balloon).style.backgroundImage = "url(" + DEATH_BALLOON + ")";
                        } else if (type === 2) {
                            document.getElementById("b" + balloon).style.backgroundImage = "url(" + MORE_TIME_BALLOON + ")";
                        } else {
                            document.getElementById("b" + balloon).style.backgroundImage = "url(res/b" + balloon + ".png)";
                        }
                        var speed = Math.floor(Math.random() * MAX_SPEED - 1) + 1;
                        var limit = Math.floor(Math.random() * window.innerWidth) + 1;
                        var startX = Math.floor(Math.random() * (window.innerWidth / 2)) + 1;
                        if (limit < startX) limit = startX + 100;
                        balloonWorkers[balloon].postMessage({ "b": balloon, "x": startX, "limit": limit, "speed": speed, "maxspeed": MAX_SPEED });
                        workerStates[balloon] = 1;
                        balloonSpeeds[balloon] = (MAX_SPEED - speed) + 0;
                        balloonWorkers[balloon].onmessage = function (event) {
                            if (event.data.y > (window.innerHeight + 110) ||
                                document.getElementById("b" + event.data.b).style.backgroundImage.indexOf(POP_IMAGE) > -1) {
                                this.terminate();
                                workerStates[event.data.b] = 0;
                                balloonSpeeds[event.data.b] = 0;
                                if (event.data.y > (window.innerHeight + 110) && document.getElementById("time").innerHTML > 10 &&
                                    document.getElementById("b" + event.data.b).style.backgroundImage.indexOf(POP_IMAGE) === -1 &&
                                    document.getElementById("b" + event.data.b).style.backgroundImage.indexOf(DEATH_BALLOON) === -1 &&
                                    document.getElementById("b" + event.data.b).style.backgroundImage.indexOf(MORE_TIME_BALLOON) === -1) {
                                    // document.getElementById("time").innerHTML = 
                                    // document.getElementById("time").innerHTML - 10;
                                    // document.getElementById("time").style.color = "rgb(255,0,0)";
                                }
                            } else {
                                document.getElementById("b" + event.data.b).style.bottom = event.data.y + "px";
                                document.getElementById("b" + event.data.b).style.left = event.data.x + "px";
                                document.getElementById("t" + event.data.b).style.bottom = (event.data.y - 98) + "px";
                                document.getElementById("t" + event.data.b).style.left = (event.data.x + 23) + "px";
                                var tail = ((event.data.y % 2) === 0) ? "1" : "0";
                                document.getElementById("t" + event.data.b).style.backgroundImage = "url(res/tail" + tail + ".png)";
                            }
                        };
                    }
                    balloon++;
                    if (balloon > MAX_BALLOONS - 1) {
                        balloon = 0;
                    }

                    if (document.getElementById("time").innerHTML === "0" && !gameover) {
                        gameover = true;
                        document.getElementById("gameover").style.visibility = "visible";
                        var highscore = window.localStorage.getItem("highscore");
                        var playername = window.localStorage.getItem("playername");
                        if (highscore !==  undefined && highscore !==  null) {
                            if ((document.getElementById("score").innerHTML * 1) > highscore) {
                                window.localStorage.setItem("highscore", document.getElementById("score").innerHTML);
                            }
                        } else {
                            window.localStorage.setItem("highscore", document.getElementById("score").innerHTML);
                        }

                        if (playername !==  undefined && playername !==  null) {
                            document.getElementById("playername").value = playername;
                        }

                        highscore = window.localStorage.getItem("highscore");
                        document.getElementById("highscore").innerHTML = document.getElementById("score").innerHTML;

                        document.getElementById("score-label").style.visibility = "hidden";
                        document.getElementById("score").style.visibility = "hidden";
                        document.getElementById("time-label").style.visibility = "hidden";
                        document.getElementById("time").style.visibility = "hidden";

                    } else {
                        document.getElementById("time").innerHTML =
                            document.getElementById("time").innerHTML - 1;
                        document.getElementById("time").style.color = "rgb(0,0,0)";
                    }

                    if (gameover) {
                        var i = 0;
                        for (i = 0; i < MAX_BALLOONS; i++) {
                            var y = 1 * (document.getElementById("b" + i).style.bottom.replace("px", ""));
                            if (y > 0 && y < window.innerHeight) {
                                break;
                            }
                        }
                        if (i === MAX_BALLOONS) {
                            document.getElementById("restart").style.visibility = "visible";
                            window.clearInterval(interval);
                        }
                    }
                }
                catch (error) {
                    //alert(error.message);
                }
                }
                , 1000);
        }
        catch (error) {
            //alert(error.message);
        }
    }

    function pop(id) {
        if (document.getElementById("time").innerHTML > 0) {
            var element = document.getElementById(id);
            element.onclick = function () { };
            element.ontouchstart = function () { };
            var index = id.replace("b", "").trim();
            if (element.style.backgroundImage.indexOf(DEATH_BALLOON) > -1) {
                document.getElementById("time").innerHTML = 0;
            } else if (element.style.backgroundImage.indexOf(MORE_TIME_BALLOON) > -1) {
                document.getElementById("time").innerHTML =
                    (document.getElementById("time").innerHTML * 1) + 10;
            }
            var tail = document.getElementById("t" + index);
            playAudio(POP_AUDIO, true);
            element.style.width = "100px";
            element.style.backgroundImage = "url(" + POP_IMAGE + ")";
            tail.style.visibility = "hidden";
            var timeout = setTimeout(function () {
                element.style.visibility = "hidden";
                element.style.bottom = "-260px";
                element.style.visibility = "visible";
                tail.style.visibility = "visible";
                tail.style.bottom = "-360px";
                element.style.width = "50px";
            }, 300);
            element.onclick = function () { pop(this.id); };
            element.ontouchstart = function () { pop(this.id); };
            document.getElementById("score").innerHTML =
                (document.getElementById("score").innerHTML * 1 + points[id] * balloonSpeeds[index]);
        }
    }

    function playAudio(audioSource, aud) {
        if (aud) {
            document.getElementById("audioplayer").src = audioSource;
            var audio = document.getElementById("audioplayer");
            if (typeof device !==  "undefined") {
                if (device.platform === "Android") {
                    audioSource = "/android_asset/www/" + audioSource;
                } else if (device.platform === "WinCE") {
                    audioSource = "/app/www/" + audioSource;
                }
                audio = new Media(audioSource,
                    function () { audio.release(); }
                    , onAudioError);
                audio.play();
            } else {
                audio.play();
            }
        }
    }

    function onAudioError() {
        //alert("code: " + error.code + "\n" +
        //    "message: " + error.message + "\n");
    }