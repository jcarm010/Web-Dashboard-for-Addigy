package comm;

import comm.pubnub.WDAPubNub;

/**
 *
 * @author javier
 */
public class ReceiverFactory {
    /**
     * 
     * @return 
     */
    public static Receiver getReceiver(){
        return WDAPubNub.getSharedPubNubReceiver();
    }
}
