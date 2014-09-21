package reporting;

import collector.Collector;
import collector.CollectorFactory;
import collector.RunningProcess;
import java.io.File;
import java.util.List;
import org.json.JSONException;
import org.json.JSONObject;
import publish.Publisher;
import publish.PublisherFactory;

/**
 * Handles reporting of the collection of data.
 * @author javier
 */
public class Reporter {
    //indicates whether to continue running
    private static boolean running = true;
    private static final int intervalTime = 10000;
    //path to settings file
    public static final String settingsDir = System.getProperty("user.home")+
            File.separator+".wda-settings";
    /**
     * Run the program.
     * @param args Command line arguments.
     */
    public static void main(String [] args){
        //read settings from settings file
        Settings.readSettings(settingsDir);
        //read settings from command line
        readInputSettings(args);
//        Settings.printSettings();
        //a publisher to broadcast data
        Publisher pub = PublisherFactory.getPublisher();
        //a collector to collect statistics
        Collector collector = CollectorFactory.getCollector();
        startBroadcasting(collector,pub);
        System.exit(0);
    }
    public static void startBroadcasting(Collector collector, Publisher pub){
        //run until signaled to stop running
        while(running){
            List<RunningProcess> topMem = collector.getTopByMemory(10);
            JSONObject obj = new JSONObject();
            accumulateJson(obj,"msgType","statistics");
            accumulateJson(obj, "timeStamp", System.currentTimeMillis());
            topMem.forEach(p -> {
                try{
                    obj.append("processes", p.toJson());
                }catch(JSONException err){
                    err.printStackTrace(System.err);
                }
            });
            pub.broadcastMessage(obj);
            try{
                Thread.sleep(intervalTime);
            }catch(InterruptedException err){
                err.printStackTrace(System.err);
            }
        }
    }
    
    private static void accumulateJson(JSONObject obj,String key, Object value){
        try{
            obj.accumulate(key, value);
        }catch(JSONException err){
            err.printStackTrace(System.err);
        }
    }
    /**
     * Reads settings from the command line input
     * @param args The arguments
     */
    private static void readInputSettings(String [] args){
        for(int i = 1 ; i < args.length ; i++){
            String key = args[i-1];
            String value = args[i];
            Settings.setSetting(key, value);
        }
    }
}
