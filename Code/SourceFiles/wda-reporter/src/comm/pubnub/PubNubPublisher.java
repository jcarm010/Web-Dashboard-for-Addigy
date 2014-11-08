package comm.pubnub;

import com.pubnub.api.Callback;
import com.pubnub.api.PubnubError;
import org.json.JSONObject;
import comm.Publisher;
import java.io.File;
import org.json.JSONException;
import screen.ScreenCapture;
import utils.Utils;

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
//        System.out.println("After send: "+response.toString());
    }
    @Override
    public void errorCallback(String channel, PubnubError error) {
        System.err.println(error.toString());
    }

    @Override
    public void broadcastScreenshot(ScreenCapture capture) {
        String path = capture.saveToFile();
        if(path==null)return;
        String remote = Utils.uploadImage(path, channel);
        if(remote == null)return;
        JSONObject obj = new JSONObject();
        accumulateJson(obj,"msgType", "sshot");
        accumulateJson(obj,"path", remote);
        WDAPubNub.getSharedPubNub().publish(this.channel, obj , this);
        new File(path).delete();
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
