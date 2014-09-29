package collector;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

/**
 *
 * @author javier
 */
public class TopCollector extends Collector{
    private static final String COMMAND = "top -b -s -n 1";
    private static final int PROCESS_HEADER_LINE = 7;
    private static final int CPU_LINE = 2;
    private static final int MEM_LINE = 3;
    private static final int SWAP_LINE = 4;
    //how the targe statistics will look from the output of Top
    private static final String PID = "pid";
    private static final String NI = "ni";
    private static final String PRI = "pr";
    private static final String CPU = "%cpu";
    private static final String MEM = "%mem";
    private static final String COMM = "command";
    private static final String USER_NAME = "user";
    
    @Override
    @SuppressWarnings("empty-statement")
    public List<RunningProcess> getAllProcesses() {
        List<RunningProcess> processes = new ArrayList<>();
        BufferedReader reader = runTop();
        int lineNo = 0;
        String line;
        try {
            while((line = reader.readLine())!=null && ++lineNo<PROCESS_HEADER_LINE);
            List<String> headers = parseProcessHeaders(line);
            while((line = reader.readLine())!=null){
                line = line.trim();
                if(line.isEmpty()) continue;
                processes.add(parseProcess(line,headers));
            }
        } catch (IOException ex) {
            ex.printStackTrace(System.err);
        }
        return processes;
    }
    private static RunningProcess parseProcess(String line, List<String> headers){
        RunningProcess process = new RunningProcess();
        int i = 0;
        Scanner scan = new Scanner(line);
        while(scan.hasNext() && i<headers.size()){
            process.addFact(tryMatchHeading(headers.get(i++)), scan.next().trim());
        }
        return process;
    }
    /**
     * Tries to match a raw heading to one of the Collector's target statistics.
     * @param heading The raw heading
     * @return The Collector's conventional name or the same heading if could 
     *         not be matched.
     */
    private static String tryMatchHeading(String heading){
        switch(heading){
            case PID : return Collector.Fact.PID.toString();
            case NI : return Collector.Fact.NI.toString();
            case PRI : return Collector.Fact.PRI.toString();
            case CPU : return Collector.Fact.CPU.toString();
            case MEM : return Collector.Fact.MEM.toString();
            case COMM: return Collector.Fact.COMM.toString();
            case USER_NAME : return Collector.Fact.USER_NAME.toString();
            default : return heading ;
        }
    }
    /**
     * 
     * @param headerLine
     * @return 
     */
    private static List<String> parseProcessHeaders(String headerLine){
        List<String> headers = new ArrayList<>();
        Scanner scan = new Scanner(headerLine);
        while(scan.hasNext())
            headers.add(scan.next().trim().toLowerCase());
        return headers;
    }
    /**
     * 
     * @return 
     */
    private static BufferedReader runTop(){
        try {
            Process p = Runtime.getRuntime().exec(COMMAND);
            InputStream in = p.getInputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(in, "UTF-8"));
            return reader;
        } catch (IOException ex) {
            ex.printStackTrace(System.err);
            return null;
        }
    }

    @Override
    @SuppressWarnings("empty-statement")
    public MachineStats getSystemStats() {
        MachineStats stats = new MachineStats();
        int lineNo = 0;
        String line;
        BufferedReader reader = runTop();
        Scanner lineScan;
        try {
            while((line = reader.readLine())!=null && ++lineNo<=CPU_LINE);
            if(line!=null){
                double usage = 0;
                lineScan = new Scanner(line);
                if(lineScan.hasNext()) lineScan.next();
                String stat = null;
                while(lineScan.hasNext()){
                    if(stat == null)
                        stat = lineScan.next();
                    else{
                        String label = lineScan.next();
                        if(label.equals("us,")|| label.equals("sy,")){
                            usage+=Double.parseDouble(stat);
                        }
                        stat = null;
                    }
                }
                stats.addFact(Collector.Fact.SYS_CPU_PERCENT.toString(), usage);
            }
            if((line = reader.readLine())!=null){
                lineScan = new Scanner(line);
                lineScan.next();
                lineScan.next();
                String stat = null;
                while(lineScan.hasNext()){
                    if(stat == null)
                        stat = lineScan.next();
                    else{
                        String label = lineScan.next();
                        switch(label){
                            case "total,": 
                                stats.addFact(Collector.Fact.SYS_MEM_TOTAL.toString(), Integer.parseInt(stat));
                                break;
                            case "used,":
                                stats.addFact(Collector.Fact.SYS_MEM_USED.toString(), Integer.parseInt(stat));
                                break;
                            case "free,":
                                stats.addFact(Collector.Fact.SYS_MEM_FREE.toString(), Integer.parseInt(stat));
                                break;
                            case "buffers":
                                stats.addFact(Collector.Fact.SYS_MEM_BUFFERS.toString(), Integer.parseInt(stat));
                                break;
                        }
                        stat = null;
                    }
                }
            }
            if((line = reader.readLine())!=null){
                lineScan = new Scanner(line);
                lineScan.next();
                lineScan.next();
                String stat = null;
                while(lineScan.hasNext()){
                    if(stat == null)
                        stat = lineScan.next();
                    else{
                        String label = lineScan.next();
                        switch(label){
                            case "total,": 
                                stats.addFact(Collector.Fact.SYS_SWAP_TOTAL.toString(), Integer.parseInt(stat));
                                break;
                            case "used,":
                                stats.addFact(Collector.Fact.SYS_SWAP_USED.toString(), Integer.parseInt(stat));
                                break;
                            case "free.":
                                stats.addFact(Collector.Fact.SYS_SWAP_FREE.toString(), Integer.parseInt(stat));
                                break;
                            case "cached":
                                stats.addFact(Collector.Fact.SYS_SWAP_CACHED.toString(), Integer.parseInt(stat));
                                break;
                        }
                        stat = null;
                    }
                }
            }
        } catch (IOException ex) {
            ex.printStackTrace(System.err);
        }
        return stats;
    }
    
}
