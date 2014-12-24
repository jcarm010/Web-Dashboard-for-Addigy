<?php

class Option{
    public $data;
    public function __construct() {
        $this->data = array();
        array_push($this->data, array(
            "code"=>"LATEST",
            "value"=>"latest"
        ));
    }
}
/**
 * A cask
 *
 * @author javier
 */
class Cask {
    public $code;
    public $icon;
    public $options;
    public $puppetcode;
    public $resourcename;
    public $resourcetype;
    public $homepage;
    public function __construct() {
        $this->options = array();
        array_push($this->options, new Option());
        $this->icon = "defpack.png";
    }
}
