<?php
include_once 'GetCaskResponse.php';
include_once 'CaskHandler.php';
$request = $_GET?$_GET:$_POST;
$response = new GetCaskResponse();
if(!isset($request['caskName'])){
    $response->errmsg = "Malformed request";
    die(json_encode($response));
}
$response->success = true;
$caskHandler = new CaskHandler();
$cask = $caskHandler->getCask($request['caskName']);
$response->cask = $cask;
die(json_encode($response));
