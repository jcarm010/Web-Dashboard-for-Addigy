package collector;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Represents a collector object, which is in charge of collecting different
 * statistics regarding the processes running in the system such as Memory
 * and CPU usage.
 * @author javier
 */
public abstract class Collector {
    /**
     * This are some process statistics that should be collected by any 
     * collector.
     */
    public enum Fact{
        PID,//a process id 
        CPU,//cpu usage as percentage
        MEM,//memory usage as percentage
        PRI,//priority of a process
        NI,//nice value of a process
        COMM,//command used to execute a process
        USER_NAME,//the name of the user that this process belongs to
        SYS_CPU_PERCENT,
        SYS_MEM_TOTAL,
        SYS_MEM_USED,
        SYS_MEM_FREE,
        SYS_MEM_BUFFERS,
        SYS_SWAP_TOTAL,
        SYS_SWAP_USED,
        SYS_SWAP_FREE,
        SYS_SWAP_CACHED,
    }
    /**
     * Gets @qty amount of processes that are consuming the most amount of
     * memory.
     * @param qty The quantity of processes to include in the list.
     * @return The top @qty processes running in the system ranked by memory
     *         usage from most memory in use to least amount of memory in use.
     *         Null if there was some error.
     */
    public List<RunningProcess> getTopByMemory(int qty){
        //get list of all processes
        List<RunningProcess> unsorted = getAllProcesses();
        //return null if error getting all processes
        if(unsorted == null)return null;
        //sort the processes by memory
        Collections.sort(unsorted, (one,two)->{
            //get first meory value
            String valueOne = one.getValue(Collector.Fact.MEM.toString());
            //get second memory value
            String valueTwo = two.getValue(Collector.Fact.MEM.toString());
            //get value of first as a double
            Double vOne = Double.parseDouble(valueOne);
            //get value of second as a double
            Double vTwo = Double.parseDouble(valueTwo);
            //negative if first < second, 0 if first = second, 
            //and positive if first > second
            return vOne.compareTo(vTwo);
        });
        //list of top qty
        List<RunningProcess> sorted = new ArrayList<>();
        int seen = 0;//number of processes seen
        //go through list of sorted processes starting at the end until begining
        //or have been through qty processes
        for(int i = unsorted.size()-1; i>=0 && seen++ < qty;i--)
            //add to the list of top qty processes
            sorted.add(unsorted.get(i));
        //return list of top qty processes
        return sorted;
    }
    /**
     * Gets @qty amount of processes that are consuming the most amount of
     * CPU.
     * @param qty The quantity of processes to include in the list.
     * @return The top @qty processes running in the system ranked by CPU
     *         usage from most CPU in use to least amount of CPU in use.
     *         Null if there was some error.
     */
    public List<RunningProcess> getTopByCPU(int qty){
        //get list of all processes
        List<RunningProcess> unsorted = getAllProcesses();
        //return null if error getting all processes
        if(unsorted == null)return null;
        //sort the processes by memory
        Collections.sort(unsorted, (one,two)->{
            //get first meory value
            String valueOne = one.getValue(Collector.Fact.CPU.toString());
            //get second memory value
            String valueTwo = two.getValue(Collector.Fact.CPU.toString());
            //get value of first as a double
            Double vOne = Double.parseDouble(valueOne);
            //get value of second as a double
            Double vTwo = Double.parseDouble(valueTwo);
            //negative if first < second, 0 if first = second, 
            //and positive if first > second
            return vOne.compareTo(vTwo);
        });
        //list of top qty
        List<RunningProcess> sorted = new ArrayList<>();
        int seen = 0;//number of processes seen
        //go through list of sorted processes starting at the end until begining
        //or have been through qty processes
        for(int i = unsorted.size()-1; i>=0 && seen++ < qty;i--)
            //add to the list of top qty processes
            sorted.add(unsorted.get(i));
        //return list of top qty processes
        return sorted;
    }
    /**
     * Collects statistics about all the processes running on the system.
     * @return A list of all running processes without any order. Null if error.
     */
    public abstract List<RunningProcess> getAllProcesses();
    
    public abstract MachineStats getSystemStats();
}
