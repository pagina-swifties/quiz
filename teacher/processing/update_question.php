<?php
require '../models/Teacher.php';

$teacher = new Teacher();
$data = array();
$data['question-id'] = $_POST['questionId'];
$data['question'] =  $_POST['question'];
$data['question-type'] = $_POST['questionType'];
$data['points'] = $_POST['points'];
if (isset($_POST['answer'])) $data['answer'] = $_POST['answer'];
if (isset($_POST['choices'])) $data['choices'] = $_POST['choices'];
echo json_encode($data);
$teacher->updateQuestion($data);
