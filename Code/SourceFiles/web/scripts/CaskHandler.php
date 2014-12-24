<?php
include_once 'Cask.php';
/**
 * Description of CaskHandler
 *
 * @author javier
 */
class CaskHandler {
    private $casksPath;
    public function __construct( /*...*/ ) {
        $this->casksPath = "../resources/homebrew-cask/Casks/";
    }
    public function listCasks(){
        $files = scandir($this->casksPath);
        $casks = array();
        for($i = 2 ; $i < count($files);$i++){
            array_push($casks, substr($files[$i],0,-3));
        }
        return $casks;
    }
    public function getCask($caskname){
        $caskpath = "$this->casksPath$caskname.rb";
        $cask = new Cask();
        $cask->code = strtoupper($caskname);
        $cask->puppetcode = "package { '$caskname': provider => 'brewcask' }";
        $cask->resourcetype = "Software Deployment";
        $cask->resourcename = ucfirst(strtolower($caskname));
        //read file
        if(!($myfile = fopen($caskpath, "r")))return null;
        $subject = fread($myfile,filesize($caskpath));
        fclose($myfile);
        $linepattern = '@homepage\s*\'([:/.\-_\?=&]*[A-Z]*[a-z]*[0-9]*)*\'@';
        $matches = array();
        preg_match($linepattern, $subject, $matches);
        $line = $matches[0];
        $urlpattern = '@\'([:/.\-_\?=&]*[A-Z]*[a-z]*[0-9]*)*\'@';
        preg_match($urlpattern, $line, $matches);
        $url = substr($matches[0],1, strlen($matches[0])-2);
        $cask->homepage = $url;
        return $cask;
    }
}
