package collector;

import java.util.ArrayList;
import java.util.List;
import org.hyperic.sigar.CpuPerc;
import org.hyperic.sigar.Mem;
import org.hyperic.sigar.ProcState;
import org.hyperic.sigar.Sigar;
import org.hyperic.sigar.SigarException;
import org.hyperic.sigar.Swap;

/**
 *
 * @author javier
 */
public class SigarCollector extends Collector{
    private final Sigar sigar;
    private final long KB = 1024;
   
    public SigarCollector(){
        sigar = new Sigar();
    }

    @Override
    public List<RunningProcess> getAllProcesses() { 
        List<RunningProcess> processes = new ArrayList<>();
        long [] pids;
        try {
            pids = sigar.getProcList();
            
        } catch (SigarException ex) {
            ex.printStackTrace(System.err);
            return processes;
        }
        
        for(long id : pids){
            try {
                RunningProcess process = new RunningProcess();
                ProcState state = sigar.getProcState(id);
                process.addFact(Collector.Fact.PID.toString(), id+"");
                double cpuPercent = sigar.getProcCpu(id).getPercent();
                process.addFact(Collector.Fact.CPU.toString(), cpuPercent*100+"");
                Mem m = sigar.getMem();
                long mem = 100*sigar.getProcMem(id).getSize()/m.getTotal();
                process.addFact(Collector.Fact.MEM.toString(), mem+"");
                process.addFact(Collector.Fact.PRI.toString(), state.getPriority()+"");
                process.addFact(Collector.Fact.NI.toString(), state.getNice()+"");
                process.addFact(Collector.Fact.COMM.toString(), state.getName());
                String user = sigar.getProcCredName(id).getUser();
                process.addFact(Collector.Fact.USER_NAME.toString(), user);
                processes.add(process);
            } catch (SigarException ex) {
                if(ex.getMessage().equals("No such process")) continue;
                ex.printStackTrace(System.err);
            }
        }
        return processes;
    }

    @Override
    public MachineStats getSystemStats() {
        MachineStats stats = new MachineStats();
        try{
            CpuPerc percs = sigar.getCpuPerc();
            stats.addFact(Collector.Fact.SYS_CPU_PERCENT.toString(), percs.getSys()*100);
            stats.addFact(Collector.Fact.CPU.toString(), percs.getUser()*100);
            Mem mem = sigar.getMem();
            stats.addFact(Collector.Fact.SYS_MEM_FREE.toString(), mem.getActualFree()/KB);
            stats.addFact(Collector.Fact.SYS_MEM_TOTAL.toString(), mem.getTotal()/KB);
            stats.addFact(Collector.Fact.SYS_MEM_USED.toString(), mem.getActualUsed()/KB);
            Swap swap = sigar.getSwap();
            stats.addFact(Collector.Fact.SYS_SWAP_FREE.toString(), swap.getFree()/KB);
            stats.addFact(Collector.Fact.SYS_SWAP_TOTAL.toString(), swap.getTotal()/KB);
            stats.addFact(Collector.Fact.SYS_SWAP_USED.toString(), swap.getUsed()/KB);
        }catch(SigarException err){
            err.printStackTrace(System.err);
        }
        return stats;
    }
}
