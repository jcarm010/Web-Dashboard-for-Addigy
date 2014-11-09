<?php
$response = new Response();
if(!$_FILES || !$_FILES['userfile']){
    $response->errMsg = "Invalid Upload Protocol";
}else if (is_uploaded_file($_FILES['userfile']['tmp_name'])) {
    $milliseconds = round(microtime(true) * 1000);
    $uploads_dir = '../uploads';
    $headers = apache_request_headers();
    $udir = $headers['machineId'];
    //check if exits
    if(!file_exists($uploads_dir)){
        mkdir("$uploads_dir");
    }
    if(!file_exists("$uploads_dir/$udir")){
        mkdir("$uploads_dir/$udir");
    }
    $dest = "$udir/$milliseconds.jpg";
    move_uploaded_file($_FILES['userfile'] ['tmp_name'], "$uploads_dir/$dest");
    $response->success = true;
    $response->path = $dest;
} else {
    $response->errMsg = "Possible file upload attack: filename '" . $_FILES['userfile']['tmp_name'] . "'.";
}
die(json_encode($response));
class Response{
    public $success;
    public $errMsg;
    public $path;
    public function __construct() {
        $this->success = false;
        $this->errMsg = null;
        $this->path = null;
    }
}
