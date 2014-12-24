<?php
/**
 * A json response
 *
 * @author javier
 */
class RequestResponse {
    public $success;
    public $errmsg;
    public function __construct( /*...*/ ) {
        $this->success = false;
        $this->errmsg = null;
    }
}
