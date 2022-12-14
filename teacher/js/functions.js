async function getClasses() {
    let classes = [];
    await $.ajax(
        {
            url: 'processing/get_all_classes.php',
            dataType: 'json',
            success: (c) => {
                classes = c;
            }
        });
    return classes;
}

async function getAllTests() {
    let tests = [];
    await $.ajax(
        {
            url: 'processing/get_all_tests.php',
            dataType: 'json',
            success: (t) => {
                tests = t;
            }
        });
    return tests;
}

async function getTests(classCode) {
    let tests = [];
    await $.ajax(
        {
            url: `processing/get_tests.php?classCode=${classCode}`,
            dataType: 'json',
            success: (t) => {
                tests = t;
            }
        });
    return tests;
}

async function getResponseDetails(responseID) {
    let details = [];
    await $.ajax(`processing/get_response_details.php?responseID=${responseID}`,
        {
            // url: `processing/get_response_details.php?responseID=${responseID}`,
            // dataType: 'json',
            // success: (t) => {
            //     details = t;
            // }
            success: (q) => {
                details = JSON.parse(q);
            }
        });
    return details;
}

async function getClassDescription(classCode) {
    let classDescription = "";
    await $.ajax(
        {
            url: `processing/get_class_description.php?classCode=${classCode}`,
            dataType: 'text',
            success: (cd) => {
                classDescription = cd.replace(/['"]+/g, "");;
            }
        });
    return classDescription;
}

async function getQuestions(testId) {
    let questions = [];
    await $.ajax(`processing/get_questions.php?testId=${testId}`,
        {
            success: (q) => {
                questions = JSON.parse(q);
            }
        });
    return questions;
}

async function getResponses(testId) {
    let response = [];
    await $.ajax(`processing/get_responses.php?testId=${testId}`,
        {
            success: (q) => {
                response = JSON.parse(q);
            }
        });
    return response;
}

async function getStudent(studentId) {
    let student = [];
    await $.ajax(`processing/get_student.php?studentID=${studentId}`,
        {
            success: (q) => {
                student = JSON.parse(q);
            }
        });
    return student;
}

async function getTotalPoints(testID) {
    let points = [];
    await $.ajax(`processing/get_total_points.php?test_id=${testID}`,
        {
            success: (q) => {
                points = JSON.parse(q);
            }
        });
    return points;
}

async function getSchedules(testId) {
    let schedules = [];
    await $.ajax(`processing/get_schedules.php?testId=${testId}`,
        {
            success: (q) => {
                schedules = JSON.parse(q);
            }
        });
    return schedules;
}

async function getCurrentClass() {
    let _class = [];
    await $.ajax(
        {
            url: 'processing/get_current_class.php',
            dataType: 'json',
            success: (c) => {
                _class = c;
            }
        });
    return _class;
}

async function getCurrentTest() {
    let test = [];
    await $.ajax(
        {
            url: 'processing/get_current_test.php',
            dataType: 'json',
            success: (t) => {
                test = t;
            }
        });
    return test;
}

async function deleteQuestion(questionId) {
    await $.ajax(`processing/delete_question.php?questionId=${questionId}`,
    {
        success: () => {
            console.log("Deleted question.");
        }
    });
}

async function resetSession() {
    await $.ajax(
        {
            url: 'processing/reset_session.php',
            success: () => {
                window.location.assign('dashboard.php');
            }
        });
}

function setModalContent(header, content) {
    $('.modal-header span').html(header);
    $('.modal-content').html(content);
}

function openModal() {
    modal.classList.add('is-visible');
}

function closeModal() {
    modal.classList.remove('is-visible');
}

function createHiddenInput(name, value) {
    let hidden = document.createElement('input');
    hidden.setAttribute('type', 'hidden');
    hidden.setAttribute('name', name);
    hidden.setAttribute('value', value);
    return hidden;
}

function createLabel(_for, content) {
    let label = document.createElement('label');
    label.htmlFor = _for;
    label.textContent = content;
    return label;
}

function createButton(_class, textContent) {
    let button = document.createElement('button');
    button.classList.add(_class);
    button.textContent = textContent;
    return button;
}