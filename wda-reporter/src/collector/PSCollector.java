package collector;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Scanner;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author javier
 */
public class PSCollector implements Collector{
    private static final String PID = "pid";
    private static final String NI = "ni";
    private static final String PRI = "pri";
    private static final String CPU = "%cpu";
    private static final String MEM = "%mem";
    private static final String COMM = "command";
    private List<RunningProcess> extractRunningProcesses(BufferedReader reader){
        List<RunningProcess> proceses = new ArrayList<>();
        ArrayList<String> headers = new ArrayList<>();
        String s;
        try {
            if((s = reader.readLine()) != null){
                String headerLine = s;
                Scanner headScan = new Scanner(headerLine);
                while(headScan.hasNext())
                    headers.add(headScan.next().trim().toLowerCase());
            }
        } catch (IOException ex) {
            ex.printStackTrace(System.err);
            return null;
        }
        try {
            while ((s = reader.readLine()) != null) {
                RunningProcess p = new RunningProcess();
                Scanner lineScan = new Scanner(s);
                int ind = 0;
                while(lineScan.hasNext()){
                    String f = lineScan.next();
                    p.addFact(tryMatchHeading(headers.get(ind++)), f);
                }
                proceses.add(p);
            }
        } catch (IOException ex) {
            Logger.getLogger(PSCollector.class.getName()).log(Level.SEVERE, null, ex);
        }
        return proceses;
    }
    
    private String tryMatchHeading(String heading){
        switch(heading){
            case PID : return Collector.Fact.PID.toString();
            case NI : return Collector.Fact.NI.toString();
            case PRI : return Collector.Fact.PRI.toString();
            case CPU : return Collector.Fact.CPU.toString();
            case MEM : return Collector.Fact.MEM.toString();
            case COMM: return Collector.Fact.COMM.toString();
            default : return heading ;
        }
    }
    private Process startProcess(String command){
        Process proc = null;
        try {
            proc = Runtime.getRuntime().exec(command);
        } catch (IOException ex) {
            ex.printStackTrace(System.err);
        }
        return proc;
    }
    @Override
    public List<RunningProcess> getAllProcesses(){
        String command;
        command ="ps -eo pid,ni,pri,pcpu,pmem,comm";
        Process proc = startProcess(command);
        if(proc == null) return null;
        BufferedReader stdInput = new BufferedReader(
                new InputStreamReader(proc.getInputStream()));
        List<RunningProcess> proceses = this.extractRunningProcesses(stdInput);
        return proceses;
    } 
    @Override
    public List<RunningProcess> getTopByMemory(int qty){
        List<RunningProcess> unsorted = getAllProcesses();
        if(unsorted == null)return null;
        Collections.sort(unsorted, (one,two)->{
            String valueOne = one.getValue(Collector.Fact.MEM.toString());
            String valueTwo = two.getValue(Collector.Fact.MEM.toString());
            if(valueOne == null)
                return -1;
            if(valueTwo == null)
                return 1;
            Double vOne = Double.parseDouble(valueOne);
            Double vTwo = Double.parseDouble(valueTwo);
            return vOne.compareTo(vTwo);
        });
        List<RunningProcess> sorted = new ArrayList<>();
        int seen = 0;
        for(int i = unsorted.size()-1; i>-0 && seen++ < qty;i--)
            sorted.add(unsorted.get(i));
        return sorted;
    }
}
