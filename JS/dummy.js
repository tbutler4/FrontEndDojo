// Pink Trivia 2017
// By: Aaron Michael McNulty
// Monkey Stomp Games 2017
//
// All rights reserved
if (window.attachEvent) {window.attachEvent('onload', load);}
else if (window.addEventListener) {window.addEventListener('load', load, false);}
else {document.addEventListener('load', load, false);}
function load() {
    /**
     * This self-invoking function is called to set up the categories for the game. This is done by making a call to the Open Trivia Database API and requesting a list of all the categories. All of the categories are then received and appended to the category drop down box.
     */
    (function() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://opentdb.com/api_category.php", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                var categories = JSON.parse(xhr.responseText).trivia_categories;
                for (var i = 0; i < categories.length; i++) {
                    var newOption = document.createElement("option");
                    newOption.value = categories[i].id;
                    newOption.innerHTML = categories[i].name;
                    game.categoryDropDown.appendChild(newOption);
                }
            }
        }
        xhr.send(null);
    })();
    /**
     * The game object contains all of the variables and logic for the game's operation.
     */    
    var game = {
        /** The drop down list of different trivia categories. */
        categoryDropDown: document.getElementById("category"),
        /** The start button to begin a new round of trivia. */
        startButton: document.getElementById("startButton"),
        /** The div that contains the circle timer. */
        timer: document.getElementById("timer"),
        /** The div that contains the questions, answers, and results. */
        QAsection: document.getElementById("QAsection"),
        /** The div that contains the message after answering a question. */
        alertSection: document.getElementById("alertSection"),
        /** The message that is displayed to the user after answering a question. */
        alertMessage: document.getElementById("alertMessage"),
        /** The div that contains the results after each round of trivia. */
        resultsSection: document.getElementById("resultsSection"),
        /** The header in the results screen. */
        resultsHeaderMessage: document.getElementById("resultsMessage"),
        /** The paragraph element for displaying the correct answers for the last completed round. */
        currentCorrectMessage: document.getElementById("currentCorrect"),
        /** The paragraph element for displaying the number of incorrect answers for the last completed round. */
        currentIncorrectMessage: document.getElementById("currentIncorrect"),
        /** The paragraph element for displaying the total number of correct answers for the entire game. */
        totalCorrectMessage: document.getElementById("totalCorrect"),
        /** The paragraph element for displaying the total number of incorrect answers for the entire game. */
        totalIncorrectMessage: document.getElementById("totalIncorrect"),
        /** The variable used to keep track of the time remaining on the timer. */
        secondsCounter: 30,
        /** The interval id associated with the timer. This is used to clear the interval and stop the timer when needed. */
        timerIntervalId: null,
        /** The results of the most recent query to Open Trivia Database are stored in this variable. */
        questionSet: null,
        /** Used to keep track of what question the game is on when searching through the questionSet variable. */
        questionIndex: 0,
        /** The header element used to display the current trivia question. */
        currentQuestion: document.getElementById("currentQuestion"),
        /** An array of paragraph elements used to display the the current multiple choice answers. */
        answers: document.getElementsByClassName("answerText"),
        /** The index of the correct answer in the answers array for the current question. */
        correctAnswerIndex: null,
        /** The running total of correct answers for the entire game. */
        totalCorrect: 0,
        /** The running total of incorrect answers for the entire game. */
        totalIncorrect: 0,
        /** The running total of correct answers for the current round. */
        currentRoundCorrect: 0,
        /** The running total of incorrect answers for the current round. */
        currentRoundIncorrect: 0,
        /** 
         * This method is used to add transformations to appropriate part of the timer to create the circle progress bar effect.
         * @param {Number} progress
         * The percent of progress from 0-100 to be displayed.
         */
        renderProgress: function(progress) {
            if(progress<25){
                var angle = -90 + (progress/100)*360;
                $(".animate-0-25-b").css("transform","rotate("+angle+"deg)");
                $(".animate-25-50-b, .animate-50-75-b, .animate-75-100-b").css("transform", "rotate(-90deg)");
            }
            else if(progress>=25 && progress<50){
                var angle = -90 + ((progress-25)/100)*360;
                $(".animate-25-50-b").css("transform","rotate("+angle+"deg)");
                $(".animate-50-75-b, .animate-75-100-b").css("transform", "rotate(-90deg)");
            }
            else if(progress>=50 && progress<75){
                var angle = -90 + ((progress-50)/100)*360;
                $(".animate-50-75-b").css("transform","rotate("+angle+"deg)");
                $(".animate-75-100-b").css("transform","rotate(-90deg)");
            }
            else if(progress>=75 && progress<=100){
                var angle = -90 + ((progress-75)/100)*360;
                $(".animate-0-25-b, .animate-25-50-b, .animate-50-75-b").css("transform", "rotate(0deg)");
                $(".animate-75-100-b").css("transform","rotate("+angle+"deg)");
            }
            $(".text").html(game.secondsCounter + "s");
        },
        /** 
         * This method is called to start the timer at 30 seconds.
         */
        startTimer: function() {
            game.secondsCounter = 30;
            game.renderProgress((game.secondsCounter / 30) * 100);
            $(".loader-spiner").css("border-color", "#92C695");
            $(".text").css("color", "#92C695");
            game.timerIntervalId = setInterval(function() {
                game.secondsCounter -= 1;
                if (game.secondsCounter === 0) {
                    game.stopTimer();
                    game.timeExpired();
                }
                if (game.secondsCounter === 8) {
                    $(".loader-spiner").css("border-color", "#AF4E4B");
                    $(".text").css("color", "#AF4E4B");
                }
                game.renderProgress((game.secondsCounter / 30) * 100);
            }, 1000);
        },
        /**
         * This method is called to stop the timer.
         */
        stopTimer: function() {
            clearInterval(game.timerIntervalId);
        },
        /**
         * This method displays the timer to the view.
         */
        showTimer: function() {
            game.timer.style.visibility = "visible";
        },
        /**
         * This method hides the timer in the view.
         */
        hideTimer: function() {
            game.timer.style.visibility = "hidden";
        },
        /**
         * This method displays the categories drop down in the view.
         */
        showCategories: function() {
            game.categoryDropDown.style.visibility = "visible";
        },
        /**
         * This method hides the categories drop down in the view.
         */
        hideCategories: function() {
            game.categoryDropDown.style.visibility = "hidden";
        },
        /**
         * This method displays the start button in the view.
         */
        showStartButton: function() {
            game.startButton.style.visibility = "visible";
        },
        /**
         * This method hides the start button in the view.
         */
        hideStartButton: function() {
            game.startButton.style.visibility = "hidden";
        },
        /**
         * This method displays the question and answers section in the view.
         */
        showQAsection: function() {
            game.QAsection.style.display = "block";
        },
        /**
         * This method hides the question and answers section in the view.
         */
        hideQAsection: function() {
            game.QAsection.style.display = "none";
        },
        /**
         * This method displays the alert section in the view.
         */
        showAlertSection: function() {
            game.alertSection.style.display = "block";
        },
        /**
         * This method hides the alert section in the view.
         */
        hideAlertSection: function() {
            game.alertSection.style.display = "none";
        },
        /**
         * This method displays the results section in the view.
         */
        showResultsSection: function() {
            game.resultsSection.style.display = "block";
        },
        /**
         * This method hides the results section in the view.
         */
        hideResultsSection: function() {
            game.resultsSection.style.display = "none";
        },
        /**
         * This method is called to start the game. This is called when the start button is pressed.
         */
        startGame: function() {
            game.questionIndex = 0;
            game.currentRoundCorrect = 0;
            game.currentRoundIncorrect = 0;
            game.generateQuestions(function() {
                game.hideStartButton();
                game.hideCategories();
                game.displayNextQuestion();
                game.hideAlertSection();
                game.hideResultsSection();
                game.showQAsection();
                game.showTimer();
                game.startTimer();
            });
        },
        /**
         * This method is called when the timer runs down to zero seconds.
         */
        timeExpired: function() {
            game.showAlert("Out Of Time!!<br>The correct answer is: " + game.answers[game.correctAnswerIndex].innerHTML, function() {
                game.totalIncorrect++;
                game.currentRoundIncorrect++;
                game.hideAlertSection();
                game.showQAsection();
                game.startTimer();
                game.displayNextQuestion();
            });
        },
        /**
         * This method generates questions by making an api call to the Open Trivia Database API. The result is stored in the questionSet variable once the call is completed and then calls a callback function.
         * @param {Function} callback
         * The callback function that is called when the response from the Open Trivia Database API is complete.
         */
        generateQuestions: function(callback) {
            var categoryID = game.categoryDropDown.options[game.categoryDropDown.selectedIndex].value;
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "https://opentdb.com/api.php?amount=5&category=" + categoryID +"&type=multiple", true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
                    game.questionSet = JSON.parse(xhr.responseText).results;
                    callback();
                }
            }
            xhr.send(null);
        },
        /**
         * This method updates the question and answer display with the next question for the round. The method also checks if there is not another question for the round. If there are no more questions it finishes the round and makes a call to show the results section.
         */
        displayNextQuestion: function() {
            for (var i = 0; i < game.answers.length; i++) {
                game.answers[i].parentElement.className = "answer";
            }
            if (game.questionIndex < game.questionSet.length) {
                game.currentQuestion.innerHTML = game.questionSet[game.questionIndex].question;
                game.correctAnswerIndex = Math.floor(Math.random() * 4);
                var incorrectAnswerIndex = 0;
                for (var i = 0; i < 4; i++) {
                    if (i === game.correctAnswerIndex) {
                        game.answers[i].innerHTML = game.questionSet[game.questionIndex].correct_answer;
                    }
                    else {
                        game.answers[i].innerHTML = game.questionSet[game.questionIndex].incorrect_answers[incorrectAnswerIndex++];
                    }
                }
                game.questionIndex++;
            }
            else {
                game.hideQAsection();
                game.updateResults();
                game.stopTimer();
                game.hideTimer();
                game.showCategories();
                game.showStartButton();
                game.showResultsSection();
            }
        },
        /**
         * This method checks to see if the users selected answer is correct or incorrect. After doing the check this method will increment the appropriate scores, display alerts, stop and start the timer. and finally make a call to display the next question.
         */
        checkAnswer: function() {
            game.stopTimer();
            for (var i = 0; i < game.answers.length; i++) {
                if (game.answers[i].innerHTML === this.children[0].innerHTML) {
                    if (game.correctAnswerIndex === i) {
                        this.className = "answer correct";
                        setTimeout(function() {
                            game.showAlert("Correct!", function() {
                                game.totalCorrect++;
                                game.currentRoundCorrect++;
                                game.hideAlertSection();
                                game.showQAsection();
                                game.startTimer();
                                game.displayNextQuestion();
                            });
                        }, 1000);
                    }
                    else {
                        this.className = "answer incorrect"
                        game.answers[game.correctAnswerIndex].parentElement.className = "answer correct";
                        setTimeout(function() {
                            game.showAlert("Incorrect<br>The correct answer is: " + game.answers[game.correctAnswerIndex].innerHTML, function() {
                                game.totalIncorrect++;
                                game.currentRoundIncorrect++;
                                game.hideAlertSection();
                                game.showQAsection();
                                game.startTimer();
                                game.displayNextQuestion();
                            });
                        }, 1000);
                    }
                }
            }
        },
        /**
         * This method is used to update and display a message to the user in the alert section. After message has been displayed for two seconds this method calls it's callback function.
         * @param {String} message
         * The message to be displayed to the user.
         * @param {Function} callback
         * The callback function is called after two seconds of displaying the message.
         */
        showAlert: function(message, callback) {
            game.hideQAsection();
            game.alertMessage.innerHTML = message;
            game.showAlertSection();
            setTimeout(function() {
                callback();
            }, 2000);
        },
        /**
         * This method is used to display the results from the previous round in the results section. The header message is determined based on how well the user did in the last round.
         */
        updateResults: function() {
            switch (game.currentRoundCorrect) {
                case 5:
                    game.resultsHeaderMessage.innerHTML = "Perfect Score!";
                    break;
                case 4:
                    game.resultsHeaderMessage.innerHTML = "Great Job!";
                    break;
                case 3:
                    game.resultsHeaderMessage.innerHTML = "Nice";
                    break;
                case 2:
                    game.resultsHeaderMessage.innerHTML = "You can do better...";
                    break;
                case 1:
                    game.resultsHeaderMessage.innerHTML = "You struggled on that round."
                    break;
                case 0:
                    game.resultsHeaderMessage.innerHTML = "You did very poorly...";
                    break;
                default:
                    game.resultsHeaderMessage.innerHTML = "End of round";
            }
            game.currentCorrectMessage.innerHTML = "This round you got: " + game.currentRoundCorrect + " questions correct.";
            game.currentIncorrectMessage.innerHTML = "This round you got: " + game.currentRoundIncorrect + " questions incorrect.";
            game.totalCorrectMessage.innerHTML = "You have gotten a total of: " + game.totalCorrect + " questions correct.";
            game.totalIncorrectMessage.innerHTML = "You have gotten a total of: " + game.totalIncorrect + " questions incorrect.";
        }
    }
    /** The event listener for the start button click. Calls the start game function. */
    game.startButton.addEventListener("click", game.startGame, false);
    /** Sets up event listeners for each of the parent div elements that contains the text for the answers. This way the entire box can be clicked on and not just the text. */
    for (var i = 0; i < game.answers.length; i++) {
        game.answers[i].parentElement.addEventListener("click", game.checkAnswer, false);
    }
}