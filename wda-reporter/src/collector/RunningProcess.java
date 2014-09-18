package collector;

import java.util.HashMap;
import java.util.Map;
import json.JSONObject;

/**
 *
 * @author javier
 */
public class RunningProcess {
    private final Map<String,String> facts ;
    public RunningProcess(){
        facts = new HashMap<>();
    }
    public void addFact(String name, String value){
        facts.put(name, value);
    }
    public String getValue(String factName){
        return facts.get(factName);
    }
    @Override
    public String toString(){
        JSONObject job = new JSONObject();
        facts.entrySet().forEach((fact)->{
            job.accumulate(fact.getKey(), fact.getValue());
        });
        return job.toString();
    }
}
