package reporting;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Settings for reporting
 * @author javier
 */
public class Settings {
    private static final Map<String,String> settings = new HashMap<>();
    public static void setSetting(String key, String value){
        settings.put(key, value);
    }
    public static String getSetting(String key){
        return settings.get(key);
    }
    public static void readSettings(String filePath){
        File setFile = new File(filePath);
        try (BufferedReader bfr = new BufferedReader(new FileReader(setFile))){
            String line;
            while((line = bfr.readLine())!=null){
                int eqInd = line.indexOf("=");
                if(eqInd<=0) continue;
                String key = line.substring(0,eqInd).trim();
                if(eqInd+1 >= line.length())
                    settings.put(key, "");
                else{
                    String value = line.substring(eqInd+1).trim();
                    settings.put(key, value);
                }
            }
        } catch (FileNotFoundException ex) {
//            ex.printStackTrace(System.err);
            System.out.println("No settings file found in:"+filePath);
        } catch (IOException ex) {
            ex.printStackTrace(System.err);
        }
    }
    public static void printSettings(){
        System.out.println(settings);
    }
}
