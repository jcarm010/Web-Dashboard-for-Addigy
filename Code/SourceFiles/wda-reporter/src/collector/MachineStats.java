package collector;

import java.util.HashMap;
import java.util.Map;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author javier
 */
public class MachineStats {
    private final Map<String,Object> stats;
    public MachineStats(){
        stats = new HashMap<>();
    }
    public void addFact(String key,Object value){
        stats.put(key, value);
    }
    public JSONObject toJson(){
        JSONObject obj = new JSONObject();
        stats.entrySet().forEach(entry -> {
            try {
                obj.accumulate(entry.getKey(), entry.getValue());
            } catch (JSONException ex) {
                ex.printStackTrace(System.err);
            }
        });
        return obj;
    }
    @Override
    public String toString(){
        return toJson().toString();
    }
}
