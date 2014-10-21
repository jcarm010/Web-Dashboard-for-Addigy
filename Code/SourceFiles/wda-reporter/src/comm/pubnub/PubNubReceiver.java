package comm.pubnub;

import com.pubnub.api.Callback;
import com.pubnub.api.PubnubException;
import comm.AdminCheckedInHandler;
import comm.ChatMessageReceivedHandler;
import comm.Receiver;
import java.io.IOException;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author javier
 */
public class PubNubReceiver extends Callback implements Receiver{
    private final String channel;
    private AdminCheckedInHandler adminCheckedIn;
    private ChatMessageReceivedHandler messageHandler;
    /**
     * 
     * @param channel 
     */
    public PubNubReceiver(String channel){
        this.channel = channel;
        adminCheckedIn = null;
        subscribe();
    }
    /**
     * 
     */
    private void subscribe(){
        try {
            WDAPubNub.getSharedPubNub().subscribe(channel, this);
        } catch (PubnubException ex) {
            ex.printStackTrace(System.err);
        }
    }
    @Override
    public void whenAdminCheckedIn(AdminCheckedInHandler handler) {
        this.adminCheckedIn=handler;
    }
    /**
     * 
     * @param obj
     * @throws JSONException
     * @throws IOException 
     */
    private void killCommand(JSONObject obj) throws JSONException, IOException{
        System.out.println("kill request >>>");    
        System.out.println(obj);
        String pid = obj.getString("pid");
        if(pid != null)
            Runtime.getRuntime().exec("kill -9 "+pid);
    }
    /**
     * 
     */
    private void reportPresence(JSONObject obj) throws JSONException{
        if("web-listener".equals(obj.getString("machineId"))){
            String msg = "{\"msgType\":\"reportPresence\",\"machineId\":\""+channel+"\"}";
            WDAPubNub.getSharedPubNub().publish(channel, msg , this);
        }
    }
    /**
     * 
     * @param obj
     * @throws JSONException 
     */
    private void processReportingPresence(JSONObject obj) throws JSONException{
        String reporter = obj.getString("machineId");
        if(reporter.equals("web-listener"))
            this.adminCheckedIn.onAdminCheckedIn(System.currentTimeMillis());
    }
    @Override
    public void successCallback(String channel, Object message) {
        JSONObject obj = (JSONObject) message;
        try {
            String type = obj.getString("msgType");
            switch (type) {
                case "killRequest": killCommand(obj); break;
                case "reportRequest": reportPresence(obj); break;
                case "reportPresence": processReportingPresence(obj); break;
                case "chatMsg": processChatMessage(obj);break;
            }
        } catch (JSONException | IOException ex) {
            ex.printStackTrace(System.err);
        }
    }

    private void processChatMessage(JSONObject obj) throws JSONException {
        if(messageHandler != null)
            messageHandler.onMessageReceived(obj.getString("sender"), obj.getString("msg"));
    }

    @Override
    public void onChatMessageReceived(ChatMessageReceivedHandler handler) {
        messageHandler = handler;
    }
}
