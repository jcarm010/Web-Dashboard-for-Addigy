package publish;

import com.pubnub.api.Callback;
import com.pubnub.api.Pubnub;
import com.pubnub.api.PubnubError;
import com.pubnub.api.PubnubException;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.json.JSONException;
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
    private final Callback subCallBack;
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
        subCallBack = new Callback() {
 
            @Override
            public void connectCallback(String channel, Object message) {
                System.err.println("Pubnub Connected");
            }

            @Override
            public void disconnectCallback(String channel, Object message) {    
                System.err.println("Pubnub disconnected");
            }
            @Override
            public void reconnectCallback(String channel, Object message) {
                System.err.println("Pubnub reconnected");
            }

            @Override
            public void successCallback(String channel, Object message) {
                JSONObject obj = (JSONObject) message;
                try {
                    String type = obj.getString("msgType");
                    if(type.equals("killRequest")){
                        System.out.println("kill request >>>");    
                        System.out.println(obj);
                        String pid = obj.getString("pid");
                        if(pid != null)
                            Runtime.getRuntime().exec("kill -9 "+pid);
                    }
                } catch (JSONException ex) {
                    ex.printStackTrace(System.err);
                } catch (IOException ex) {
                    ex.printStackTrace(System.err);
                }
            }

            @Override
            public void errorCallback(String channel, PubnubError error) {}
          };
        try {
            pubnub.subscribe(this.channel, subCallBack);
        } catch (PubnubException ex) {
            ex.printStackTrace(System.err);
        }
    }
    @Override
    public void broadcastMessage(JSONObject msg) {
        pubnub.publish(this.channel, msg , pubCallback);
    }
}
