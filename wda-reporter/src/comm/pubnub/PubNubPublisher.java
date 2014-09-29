package comm.pubnub;

import com.pubnub.api.Callback;
import com.pubnub.api.PubnubError;
import com.pubnub.api.PubnubException;
import java.io.IOException;
import org.json.JSONException;
import org.json.JSONObject;
import comm.Publisher;
import comm.pubnub.WDAPubNub;

/**
 *  A publisher that uses the PubNub services to publish data.
 *  @author javier
 */
public class PubNubPublisher extends Callback implements Publisher {
    private final String channel;
    /**
     * Instantiates a PubNubPublisher object.
     * @param channel The PubNub channel to publish to.
     */
    public PubNubPublisher(String channel){
        this.channel = channel;
    }
    @Override
    public void broadcastMessage(JSONObject msg) {
        WDAPubNub.getSharedPubNub().publish(this.channel, msg , this);
    }
    @Override
    public void successCallback(String channel, Object response) {
        System.out.println(response.toString());
    }
    @Override
    public void errorCallback(String channel, PubnubError error) {
        System.err.println(error.toString());
    }
}
