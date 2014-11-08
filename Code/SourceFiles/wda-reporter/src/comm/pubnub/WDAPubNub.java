package comm.pubnub;

import com.pubnub.api.Pubnub;
import comm.Publisher;
import comm.Receiver;
import reporting.Settings;

/**
 *
 * @author javier
 */
public class WDAPubNub {
    private static final String CHANNEL = "channel";
    private static final String PUB_KEY = "pubkey";
    private static final String SUB_KEY = "subkey";
    private static Pubnub pubnub = null;
    private static PubNubPublisher publisher = null;
    private static PubNubReceiver receiver = null;
    private static void initPubnub(){
        String pubKey = Settings.getSetting(PUB_KEY);
        if(pubKey == null)
            throw new RuntimeException("Publish Key not found in settings");
        String subKey = Settings.getSetting(SUB_KEY);
        if(subKey==null)
            throw new RuntimeException("Subscribe Key not found in settings");
        pubnub = new Pubnub(pubKey,subKey);
    }
    public static Publisher getSharedPubNubPublisher(){
        if(publisher == null){
            String channel = Settings.getSetting(CHANNEL);
            if(channel == null)
                throw new RuntimeException("Channel Name not found in settings");
            publisher = new PubNubPublisher(channel);
        }
        return publisher;    
    }
    public static Receiver getSharedPubNubReceiver(){
        if(receiver == null){
            String channel = Settings.getSetting(CHANNEL);
            if(channel == null)
                throw new RuntimeException("Channel Name not found in settings");
            receiver = new PubNubReceiver(channel);
        }
        return receiver;
    }
    public static Pubnub getSharedPubNub(){
        if(pubnub == null)
            initPubnub();
        return pubnub;
    }
}
