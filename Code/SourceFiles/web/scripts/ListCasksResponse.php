<?php
include_once 'RequestResponse.php';
/**
 * Represents a response for listing casks
 *
 * @author javier
 */
class ListCasksResponse extends RequestResponse{
    public $casks;
    public function __construct( /*...*/ ) {
        parent::__construct();
        $this->casks = array();
    }
}