package comm.pubnub;

import com.pubnub.api.Callback;
import com.pubnub.api.PubnubException;
import comm.AdminCheckedInHandler;
import comm.ChatMessageReceivedHandler;
import comm.Receiver;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Collection;
import org.hyperic.sigar.Sigar;
import org.hyperic.sigar.SigarException;
import org.json.JSONException;
import org.json.JSONObject;
import utils.Utils;
import utils.Utils.OpenPort;

/**
 *
 * @author javier
 */
public class PubNubReceiver extends Callback implements Receiver{
    private final String channel;
    private final String streamChannel;
    private AdminCheckedInHandler adminCheckedIn;
    private ChatMessageReceivedHandler messageHandler;
    private final Sigar sigar;
    /**
     * 
     * @param channel 
     */
    public PubNubReceiver(String channel){
        sigar = new Sigar();
        this.channel = channel;
        streamChannel = channel+"-stream";
        adminCheckedIn = null;
        subscribe();
    }
    /**
     * 
     */
    private void subscribe(){
        try {
            WDAPubNub.getSharedPubNub().subscribe(channel, this);
            WDAPubNub.getSharedPubNub().subscribe(streamChannel, this);
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
        if(pid != null && !pid.trim().equals("null"))
            try{
                sigar.kill(Long.parseLong(pid), "SIGTERM");
            }catch(SigarException err){
                err.printStackTrace(System.err);
            }
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
        if(!message.getClass().equals(JSONObject.class)) return;
        try {
            JSONObject obj = (JSONObject) message;
            String type = obj.getString("msgType");
            switch (type) {
                case "killRequest": killCommand(obj); break;
                case "reportRequest": reportPresence(obj); break;
                case "reportPresence": processReportingPresence(obj); break;
                case "chatMsg": processChatMessage(obj);break;
                case "runcmd": processRunCmd(obj);break;
                case "reqnetstats": reportNetStats();break;
                case "netSpeedReq": reportNetworkSpeed();break;
            }
        } catch (JSONException | IOException ex) {
            System.err.println("Error in request: "+message);
            ex.printStackTrace(System.out);
        }
    }
    private void reportNetStats() throws JSONException{
        System.out.println("Net Stats Requested!");
        new Thread(()->{
            Collection<OpenPort> ports = Utils.getOpenPorts();
            ports.stream().forEach((port) -> {
                try{
                    JSONObject obj = new JSONObject();
                    obj.accumulate("msgType", "reportPort");
                    obj.accumulate("port", port.port);
                    obj.accumulate("prot", port.protocols());
                    obj.accumulate("proc", port.getApps());
                    WDAPubNub.getSharedPubNub().publish(streamChannel, obj, this);
                }catch(Exception err){
                    err.printStackTrace(System.err);
                }
            });
            System.out.println("Finished Netstats!");
        }).start();
    }
    private void processRunCmd(JSONObject obj) throws JSONException, IOException{
        String cmd = obj.getString("cmd");
        new Thread(()->{
            try{
                Process proc = Runtime.getRuntime().exec(cmd);
                InputStream in = proc.getInputStream();
                BufferedReader br = new BufferedReader(new InputStreamReader(in, "UTF-8"));
                String line;
                while((line = br.readLine())!=null){
                    JSONObject msg = new JSONObject();
                    msg.accumulate("msgType", "cmdout");
                    msg.accumulate("stamp", System.currentTimeMillis());
                    msg.accumulate("line", line);
                    WDAPubNub.getSharedPubNub().publish(streamChannel, msg, this);
                }
            }catch(IOException | JSONException err){
                err.printStackTrace(System.err);
            }
        }).start();
        
    }

    private void processChatMessage(JSONObject obj) throws JSONException {
        if(messageHandler != null)
            messageHandler.onMessageReceived(obj.getString("sender"), obj.getString("msg"));
    }

    @Override
    public void onChatMessageReceived(ChatMessageReceivedHandler handler) {
        messageHandler = handler;
    }
    private void reportNetworkSpeed() {
        new Thread(()->{
            System.out.println("Running speed test....");
            double down = 0.0;
            double up = 0.0;
            try {
                final String searchTokenDownload = "Download:";
                final String searchTokenUpload = "Upload:";
                Process p = Runtime.getRuntime().exec("speedtest-cli");
                InputStream in = p.getInputStream();
                BufferedReader reader = new BufferedReader(new InputStreamReader(in, "UTF-8"));
                String line;
                while((line=reader.readLine())!=null){
                    boolean isDown = true;
                    int tokenSize = searchTokenDownload.length();
                    int index = line.indexOf(searchTokenDownload);
                    if(index==-1){
                        isDown = false;
                        index = line.indexOf(searchTokenUpload);
                        tokenSize = searchTokenUpload.length();
                        if(index == -1) continue;
                    }
                    int start = index+tokenSize+1;
                    String dSpeedStr = line.substring(start,line.indexOf(" ",start));
                    double speed = Double.parseDouble(dSpeedStr);
                    if(isDown) down = speed;
                    else up = speed;
                }
                System.out.println("Up: "+ up +" Down: "+down);
                JSONObject obj = new JSONObject();
                obj.put("msgType", "netSpeedRep");
                obj.put("down", down);
                obj.put("up", up);
                WDAPubNub.getSharedPubNub().publish(channel, obj , this);
            } catch (JSONException|IOException ex) {
                ex.printStackTrace(System.err);
            }
        }).start();
    }
}
