package comm;

import comm.pubnub.WDAPubNub;

/**
 *  A factory that creates publishers.
 *  @author javier
 */
public class PublisherFactory {
    /**
     * Creates a PubNubPublisher.
     * @return A PubNubPublisher.
     */
    public static Publisher getPublisher(){
        return WDAPubNub.getSharedPubNubPublisher();
    }
}
