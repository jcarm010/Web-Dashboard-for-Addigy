package collector;

/**
 *
 * @author javier
 */
public class CollectorFactory {
    public static Collector getPsCollector(){
        return new PSCollector();
    }
}
