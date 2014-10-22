package comm.pubnub;

import com.pubnub.api.Callback;
import com.pubnub.api.PubnubError;
import org.json.JSONObject;
import comm.Publisher;
import org.json.JSONException;
import screen.ScreenCapture;

/**
 *  A publisher that uses the PubNub services to publish data.
 *  @author javier
 */
public class PubNubPublisher extends Callback implements Publisher {
    private final String channel;
    private final String streamChannel;
    /**
     * Instantiates a PubNubPublisher object.
     * @param channel The PubNub channel to publish to.
     */
    public PubNubPublisher(String channel){
        this.channel = channel;
        streamChannel = channel+"-stream";
    }
    @Override
    public void broadcastMessage(JSONObject msg) {
        WDAPubNub.getSharedPubNub().publish(this.channel, msg , this);
    }
    @Override
    public void successCallback(String channel, Object response) {
//        System.out.println(response.toString());
    }
    @Override
    public void errorCallback(String channel, PubnubError error) {
        System.err.println(error.toString());
    }

    @Override
    public void broadcastScreenshot(ScreenCapture capture) {
        if(capture != null){
            String [][] pix = capture.getRgbMap();
            for(int i = 0 ; i < pix.length ; i++){
                JSONObject obj = new JSONObject();
                accumulateJson(obj,"msgType","thumbRow");
                accumulateJson(obj,"num",i);
                for(int j = 0 ; j < pix[0].length;j++)
                    appendJson(obj,"row", pix[i][j]);
                WDAPubNub.getSharedPubNub().publish(this.streamChannel, obj , this);
            }
        }
    }
    
    @Override
    public void broadcastMessage(String msg) {
        JSONObject obj = new JSONObject();
        accumulateJson(obj,"msgType","chatMsg");
        accumulateJson(obj,"sender", System.getProperty("user.name"));
        accumulateJson(obj,"msg",msg);
        WDAPubNub.getSharedPubNub().publish(this.channel, obj , this);
    }
    private static void accumulateJson(JSONObject obj,String key, Object value){
        try{
            obj.accumulate(key, value);
        }catch(JSONException err){
            err.printStackTrace(System.err);
        }
    }
    private static void appendJson(JSONObject obj,String key, Object value){
        try{
            obj.append(key, value);
        }catch(JSONException err){
            err.printStackTrace(System.err);
        }
    }
}
