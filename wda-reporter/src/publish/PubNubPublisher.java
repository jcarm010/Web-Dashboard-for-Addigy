package publish;

import com.pubnub.api.Callback;
import com.pubnub.api.Pubnub;
import com.pubnub.api.PubnubError;
import org.json.JSONObject;

/**
 *  A publisher that uses the PubNub services to publish data.
 *  @author javier
 */
public class PubNubPublisher implements Publisher {
    private final String pubKey;
    private final String subKey;
    private final String channel;
    private final Pubnub pubnub;
    private final Callback pubCallback;
    /**
     * Instantiates a PubNubPublisher object.
     * @param pubKey The PubNub publish key.
     * @param subKey The PubNub subscribe key.
     * @param channel The PubNub channel to publish to.
     */
    public PubNubPublisher(String pubKey, String subKey, String channel){
        this.subKey = subKey;
        this.pubKey = pubKey;
        this.channel = channel;
        pubnub = new Pubnub(this.pubKey,this.subKey);
        pubCallback = new Callback() {
            @Override
            public void successCallback(String channel, Object response) {
                System.out.println(response.toString());
            }
            @Override
            public void errorCallback(String channel, PubnubError error) {
                System.err.println(error.toString());
            }
        };
    }
    @Override
    public void broadcastMessage(JSONObject msg) {
        pubnub.publish(this.channel, msg , pubCallback);
    }
}
