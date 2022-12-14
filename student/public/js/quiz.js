console.log(questionsList);
startQuiz();
function startQuiz() {
    showProgressBar();
    window.onbeforeunload = function () {
        return "Your progress would be lost";
    }

    let quizWrapper = document.getElementById("quiz-wrapper");
    let totalQuestions = Object.keys(currentQuestions).length; // Total number of questions in JSON
    sequence = generateNumberSequence(numberOfQuestions, totalQuestions); // Sequence of questions

    for (let i = 0; i < sequence.length; i++) {
        switch (currentQuestions[sequence[i]].type) {
            case "identification":
                quizWrapper.appendChild(identification(currentQuestions[sequence[i]], i));
                break;
            case "true-or-false":
                quizWrapper.appendChild(trueOrFalse(currentQuestions[sequence[i]], i));
                break;
            case "multiple-choice":
                quizWrapper.appendChild(multipleChoice(currentQuestions[sequence[i]], i));
                break;
        }
    }
    rotateProgressBar(0);
    showProgressBar();
    generateSubmitButton();
}

// Generate submit button and assign event listener
function generateSubmitButton() {
    let submitWrapper = document.getElementById("submit-wrapper");
    let submitButton = document.createElement("button");
    submitButton.setAttribute("id", "submit-button");
    submitButton.innerHTML = "Submit";
    submitButton.addEventListener("click", submitQuiz);
    submitWrapper.appendChild(submitButton);
}

// Stores response locally if all questions are answered
function submitQuiz() {
    let answerWrapper = document.querySelectorAll(".input-wrapper");
    let answers = []; // Holds the answer of the user
    let answeredAll = true;
    for (let index = 0; index < answerWrapper.length; index++) { // Get answers
        let answer = "";
        if (answerWrapper[index].firstChild.className == "identification") {
            answer = answerWrapper[index].firstChild.firstChild.value;
            if (answer == "" || answer == null) {
                answeredAll = false;
                alert("Please answer all the questions");
                break;
            }

        } else if (answerWrapper[index].firstChild.classList.contains("multiple-choice")) {
            if (answerWrapper[index].querySelector("input[name='q" + (index + 1) + "']:checked")) {
                answer = answerWrapper[index].querySelector("input[name='q" + (index + 1) + "']:checked").value;
            }
            else {
                answeredAll = false;
                alert("Please answer all the questions");
                break;
            }
        } else if (answerWrapper[index].firstChild.classList.contains("true-false")) {
            if (answerWrapper[index].querySelector("input[name='q" + (index + 1) + "']:checked")) {
                answer = answerWrapper[index].querySelector("input[name='q" + (index + 1) + "']:checked").value;
            }
            else {
                answeredAll = false;
                alert("Please answer all the questions");
                break;
            }
        }
        answers.push(answer);
    }
    if (answeredAll) {
        saveLocally(currentName, idNum, currentCategory, answers, sequence);
        alert("Your response has been submitted. Thank you for answering!")
        resetQuiz();
    }
}

// Iterates through all questions and returns the number of answered questions
function countAnsweredQuestions() {
    let answerWrapper = document.querySelectorAll(".input-wrapper");
    let answerCount = 0; // Holds the answer of the user

    for (let index = 0; index < answerWrapper.length; index++) { // Get answers
        let answer = "";
        let type = answerWrapper[index].firstChild.classList;
        if (type.contains("identification")) {
            answer = answerWrapper[index].firstChild.firstChild.value;
            if (answer.length != 0) {
                answerCount++;
            }
        } else if (type.contains("multiple-choice")) {
            if (answerWrapper[index].querySelector("input[name='q" + (index + 1) + "']:checked")) {
                answerCount++;
            }
        } else if (type.contains("true-false")) {
            if (answerWrapper[index].querySelector("input[name='q" + (index + 1) + "']:checked")) {
                answerCount++;
            }
        }
    }
    return answerCount;
}

function generateQuestionLabel(question, index) {
    let label = document.createElement("label");
    label.className = "question";
    label.innerHTML = `${index + 1}. ${question}`;
    return label;
}

// Returns a div containing a multiple choice question
function multipleChoice(data, index) {
    let questionWrapper = createDiv('question-wrapper');
    let label = generateQuestionLabel(data.question, index);
    let inputWrapper = createDiv('input-wrapper');

    for (let i = 0; i < data.options.length; i++) {
        let inputDiv = createDiv('multiple-choice');
        inputDiv.classList.add('input');
        let radioButton = generateRadioButton(`q${index + 1}`, data.options[i]);
        inputDiv.appendChild(radioButton);
        inputDiv.appendChild(generateLabelForRadioButton(data.options[i]));
        inputDiv.addEventListener('click', () => {
            radioButton.checked = true;
            rotateProgressBar(countAnsweredQuestions());
        })
        inputWrapper.appendChild(inputDiv);
    }

    questionWrapper.appendChild(label);
    questionWrapper.appendChild(inputWrapper);
    return questionWrapper;
}

// Returns a div containing an identification question
function identification(data, index) {
    let questionWrapper = createDiv('question-wrapper');
    let label = generateQuestionLabel(data.question, index);
    let inputWrapper = createDiv('input-wrapper');
    let inputDiv = createDiv('identification');

    let input = document.createElement('input');
    input.type = "text";
    input.addEventListener("input", () => {
        rotateProgressBar(countAnsweredQuestions());
    });

    inputDiv.appendChild(input);
    inputWrapper.appendChild(inputDiv);

    questionWrapper.appendChild(label);
    questionWrapper.appendChild(inputWrapper);
    return questionWrapper;
}

// Returns a div containing a true or false question
function trueOrFalse(data, index) {
    let questionWrapper = createDiv('question-wrapper');
    let label = generateQuestionLabel(data.question, index);
    let inputWrapper = createDiv('input-wrapper');

    const options = ["True", "False"];
    for (let i = 0; i < options.length; i++) {
        let inputDiv = createDiv('true-false');
        inputDiv.classList.add('input');
        let radioButton = generateRadioButton(`q${index + 1}`, options[i]);
        inputDiv.appendChild(radioButton);
        inputDiv.appendChild(generateLabelForRadioButton(options[i]));
        inputDiv.addEventListener('click', () => {
            radioButton.checked = true;
            rotateProgressBar(countAnsweredQuestions());
        })
        inputWrapper.appendChild(inputDiv);
    }

    questionWrapper.appendChild(label);
    questionWrapper.appendChild(inputWrapper);
    return questionWrapper;
}

function generateLabelForRadioButton(value) {
    let label = document.createElement("label");
    label.innerHTML = value;
    return label;
}

function generateRadioButton(name, value) {
    let input = document.createElement("input");
    input.type = "radio";
    input.name = name;
    input.value = value;
    input.addEventListener("click", () => {
        rotateProgressBar(countAnsweredQuestions());
    });
    return input;
}

function rotateProgressBar(numOfAnswers) {
    const circle = document.getElementById('progress-circle');
    const bar = document.getElementById('value-bar');
    const text = document.getElementById('progress-text');

    let deg = Math.round(360 / sequence.length) * numOfAnswers;
    if (deg <= 180) {
        text.innerHTML = Math.round(numOfAnswers / sequence.length * 100) + '%';
        circle.className = ' ';
        bar.style.transform = 'rotate(' + deg + 'deg)';
    } else {
        text.innerHTML = Math.round(numOfAnswers / sequence.length * 100) + '%';
        circle.className = 'over50';
        bar.style.transform = 'rotate(' + deg + 'deg)';
    }
}

function hideProgressBar() {
    const circle = document.getElementById('progress-circle');
    circle.style.display = "none";
}

function showProgressBar() {
    const circle = document.getElementById('progress-circle');
    circle.style.display = "";
}


