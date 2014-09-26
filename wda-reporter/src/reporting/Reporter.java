package reporting;

import collector.Collector;
import collector.CollectorFactory;
import collector.RunningProcess;
import java.io.File;
import java.util.List;
import org.json.JSONException;
import org.json.JSONObject;
import comm.Publisher;
import comm.PublisherFactory;
import comm.Receiver;
import comm.ReceiverFactory;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Handles reporting of the collection of data.
 * @author javier
 */
public class Reporter {
    //indicates whether to continue running
    private static boolean running = true;
    private static final int intervalTime = 5000;
    private static boolean hasListeners = false;
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
        Receiver rec = ReceiverFactory.getReceiver();
        rec.whenAdminCheckedIn(time -> hasListeners = true);
        //a collector to collect statistics
        Collector collector = CollectorFactory.getCollector();
//        startBroadcastingStatistics(collector,pub);
        startBroadcastingSingleProcesses(collector,pub);
        System.exit(0);
    }
    public static void startBroadcastingSingleProcesses(Collector collector, Publisher pub){
        while(running){
            List<RunningProcess> processes = collector.getTopByCPU(20);
            long timeStamp = System.currentTimeMillis();
            for(int i = 0 ; i < processes.size() ;i++){
                JSONObject obj = new JSONObject();
                accumulateJson(obj, "msgType", "singleProcess");
                accumulateJson(obj, "sortedBy", Collector.Fact.CPU);
                accumulateJson(obj, "timeStamp", timeStamp);
                accumulateJson(obj, "index", i);
                accumulateJson(obj, "total", processes.size());
                accumulateJson(obj, "process", processes.get(i).toJson());
//                System.out.println(obj);
                pub.broadcastMessage(obj);
            }
            hasListeners = false;
            JSONObject reportRequest = getReportRequest();
            pub.broadcastMessage(reportRequest);
            while(!hasListeners)
                takeBreak();
        }
    }
    /**
     * Starts broadcasting statistics at intervals.
     * @param collector The object that collects information.
     * @param pub The object that broadcasts the information.
     */
    public static void startBroadcastingStatistics(Collector collector, Publisher pub){
        //run until signaled to stop running
        while(running){
            List<RunningProcess> topMem = collector.getTopByCPU(10);
            JSONObject obj = new JSONObject();
            accumulateJson(obj,"sortedBy",Collector.Fact.CPU);
            accumulateJson(obj,"msgType","statistics");
            accumulateJson(obj, "timeStamp", System.currentTimeMillis());
            topMem.forEach(p -> accumulateJson(obj,"processes", p.toJson()));
//            System.out.println(obj);
            pub.broadcastMessage(obj);
            hasListeners = false;
            JSONObject reportRequest = getReportRequest();
            pub.broadcastMessage(reportRequest);
            while(!hasListeners)
                takeBreak();
        }
    }
    private static JSONObject getReportRequest(){
        JSONObject obj = new JSONObject();
        try {
            obj.accumulate("msgType", "reportRequest");
        } catch (JSONException ex) {
            return null;
        }
        return obj;
    }
    private static void takeBreak(){
        try{
            System.out.println("*************Taking Break******************");
            Thread.sleep(intervalTime);
            System.out.println("*************Back from Break***************");
        }catch(InterruptedException err){
            err.printStackTrace(System.err);
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
