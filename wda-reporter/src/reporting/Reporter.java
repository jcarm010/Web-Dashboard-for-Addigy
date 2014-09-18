package reporting;

import collector.Collector;
import collector.CollectorFactory;
import collector.RunningProcess;
import java.io.IOException;
import java.util.List;

/**
 *
 * @author javier
 */
public class Reporter {
    
    public static void main(String [] args) throws IOException, InterruptedException{
        Collector collector = CollectorFactory.getPsCollector();
        List<RunningProcess> topMem = collector.getTopByMemory(10);
        System.out.println("qty: "+topMem.size());
        System.out.println(topMem);
    }
}
