package collector;

import java.util.HashMap;
import java.util.Map;
import json.JSONObject;

/**
 * A running process on the system and its statistics.
 * @author javier
 */
public class RunningProcess {
    //the statistics about this process
    private final Map<String,String> facts ;
    /**
     * Instantiates a Running Process with no statistics.
     */
    public RunningProcess(){
        facts = new HashMap<>();
    }
    /**
     * Adds a piece of statistic to this process.
     * @param name The name/label for the piece of statistic.
     * @param value The value for the price of statistic
     */
    public void addFact(String name, String value){
        //add it to the current list of statistics
        facts.put(name, value);
    }
    /**
     * Gets the value of a piece of statistic given a label/name.
     * @param factName The name or label of the piece of statistic.
     * @return The value of the statistic or null if not existent.
     */
    public String getValue(String factName){
        //get and return piece of statistic
        return facts.get(factName);
    }
    @Override
    public String toString(){
        //object to put the statistics in jason format
        JSONObject job = new JSONObject();
        //go through all the statistics
        facts.entrySet().forEach((fact)->{
            //add to json object
            job.accumulate(fact.getKey(), fact.getValue());
        });
        //return json object as a json string
        return job.toString();
    }
}
