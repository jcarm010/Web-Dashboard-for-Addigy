<?php
include_once 'ListCasksResponse.php';
include_once 'CaskHandler.php';
$listCasks = new CaskHandler();
$casks = $listCasks->listCasks();
$response = new ListCasksResponse();
$response->success = true;
$response->casks = $casks;
die(json_encode($response));

