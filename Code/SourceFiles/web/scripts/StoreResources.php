<?php
include_once 'RequestResponse.php';
$request = $_GET?$_GET:$_POST;
$re = $request['res'];
$resObj = json_decode($re);
$resources = json_encode($resObj,JSON_PRETTY_PRINT);
$store = new StoreResources();
$res = $store->saveResources($resources);
$response = new RequestResponse();
if($res) $response->errmsg = $res;
else $response->success = true;
die(json_encode($response));
/**
 * Stores resources
 *
 * @author javier
 */
class StoreResources {
    public $resourcesPath;
    public function __construct(){
        $this->resourcesPath = "../resources/resources.json";
    }
    public function saveResources($resources){
        if(!($myfile = fopen($this->resourcesPath, "w"))){
            return "Could not open resources for writing";
        }
        fwrite($myfile, $resources);
        fclose($myfile);
        return null;
    }
}
