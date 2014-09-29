package collector;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

/**
 * A collector that uses the PS command in order to collect statistics about the
 * processes.
 * @author javier
 */
public class PSCollector extends Collector{
    //how the targe statistics will look from the output of PS
    private static final String PID = "pid";
    private static final String NI = "ni";
    private static final String PRI = "pri";
    private static final String CPU = "%cpu";
    private static final String MEM = "%mem";
    private static final String COMM = "command";
    private static final String USER_NAME = "euser";
    /**
     * Finds all running processes from the output stream of a process executing
     * the ps command.
     * @param reader A reader reading from the output stream of a process.
     * @return A list of all running processes as output from the reader. Null
     *         if error reading from the output stream.
     */
    private List<RunningProcess> extractRunningProcesses(BufferedReader reader){
        //a list to populate with running proceses.
        List<RunningProcess> proceses = new ArrayList<>();
        //a list to store the headers from the reader's output
        ArrayList<String> headers = new ArrayList<>();
        //a string representind a line read from the reader.
        String s;
        try {
            //read a line and if successful, aka stream not ended
            if((s = reader.readLine()) != null){
                String headerLine = s;//first line is the header line
                //scanner for the headers
                Scanner headScan = new Scanner(headerLine);
                //go through all headers
                while(headScan.hasNext()){
                    //a raw header and read from the reader
                    String rawHeader = headScan.next().trim().toLowerCase();
                    //try to match with one of the collector's target statistics
                    String matched = tryMatchHeading(rawHeader);
                    //add header to the list of headers
                    headers.add(matched);
                }
            }
        } catch (IOException ex) {//if encountered an error
            //output an error message
            ex.printStackTrace(System.err);
            return null;//indicates there was an error reading from the output
        }
        try {
            //go through all the lines (one line per process)
            while ((s = reader.readLine()) != null) {//if not end of stream
                RunningProcess p = new RunningProcess();//found a process
                //scanner to go through all the statistics of the process
                Scanner lineScan = new Scanner(s);
                //index of the header for the current statistic
                int ind = 0;
                //while there are statistics and headers left
                while(lineScan.hasNext() && ind < headers.size()){
                    String f = lineScan.next();//get one piece of statistic
                    //add statistic to the process under the header name
                    p.addFact(headers.get(ind++), f);
                }
                //add proces to the list of all processes
                proceses.add(p);
            }
        } catch (IOException ex) {//if there was an error
            ex.printStackTrace(System.err);
            return null;//indicates there was an error reading from reader
        }
        return proceses;//return the list of all processes
    }
    /**
     * Tries to match a raw heading to one of the Collector's target statistics.
     * @param heading The raw heading
     * @return The Collector's conventional name or the same heading if could 
     *         not be matched.
     */
    private String tryMatchHeading(String heading){
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
     * Starts a process given a command.
     * @param command The command to be executed in order to start the process.
     * @return The process that have been started using the command. Null if
     *         error starting the process.
     */
    private Process startProcess(String command){
        //the process to be started
        Process proc = null;
        try {
            //start process
            proc = Runtime.getRuntime().exec(command);
        } catch (IOException ex) {//if error
            ex.printStackTrace(System.err);//print error message
        }
        return proc;//return Process if started successfully or null.
    }
    @Override
    public List<RunningProcess> getAllProcesses(){
        //the command to be executed in order to get all statistics
        String command;
        command ="ps a -eo pid,ni,pri,pcpu,pmem,comm,euser";
        //the processes to be started using the ps command
        Process proc = startProcess(command);
        if(proc == null) return null;//return null if error starting process
        //buffered reader to read from process' stdout
        BufferedReader stdInput = new BufferedReader(
                new InputStreamReader(proc.getInputStream()));
        //a list of all processes
        List<RunningProcess> proceses = this.extractRunningProcesses(stdInput);
        return proceses;//all processes or null if error
    } 

    @Override
    public MachineStats getSystemStats() {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
