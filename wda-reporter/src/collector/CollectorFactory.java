package collector;

/**
 * A factory to make collectors of different types.
 * @author javier
 */
public class CollectorFactory {
    /**
     * Instantiates a collector that uses that PS command to retrieve statistics.
     * @return A collector that uses the PS command.
     */
    public static Collector getCollector(){
        return new PSCollector();
    }
}
