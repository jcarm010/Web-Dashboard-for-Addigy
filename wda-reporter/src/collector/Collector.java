package collector;

import java.util.List;

/**
 *
 * @author javier
 */
public interface Collector {
    enum Fact{
        PID,CPU,MEM,PRI,NI,COMM
    }
    public List<RunningProcess> getTopByMemory(int qty);
    public List<RunningProcess> getAllProcesses();
}
