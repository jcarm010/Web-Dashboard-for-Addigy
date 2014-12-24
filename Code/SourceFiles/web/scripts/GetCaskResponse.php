<?php
include_once 'RequestResponse.php';
/**
 * The response to a get cask request
 *
 * @author javier
 */
class GetCaskResponse extends RequestResponse{
    public $cask;
    public function __construct( /*...*/ ) {
        parent::__construct();
        $this->cask = null;
    }
}
