package collector;

import java.util.List;

/**
 * Represents a collector object, which is in charge of collecting different
 * statistics regarding the processes running in the system such as Memory
 * and CPU usage.
 * @author javier
 */
public interface Collector {
    /**
     * This are some process statistics that should be collected by any 
     * collector.
     */
    enum Fact{
        PID,//a process id 
        CPU,//cpu usage as percentage
        MEM,//memory usage as percentage
        PRI,//priority of a process
        NI,//nice value of a process
        COMM//command used to execute a process
    }
    /**
     * Gets @qty amount of processes that are consuming the most amount of
     * memory.
     * @param qty The quantity of processes to include in the list.
     * @return The top @qty processes running in the system ranked by memory
     *         usage from most memory in use to least amount of memory in use.
     *         Null if there was some error.
     */
    public List<RunningProcess> getTopByMemory(int qty);
    /**
     * Collects statistics about all the processes running on the system.
     * @return A list of all running processes without any order. Null if error.
     */
    public List<RunningProcess> getAllProcesses();
}
