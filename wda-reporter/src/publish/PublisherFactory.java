package publish;

import reporting.Settings;

/**
 *  A factory that creates publishers.
 *  @author javier
 */
public class PublisherFactory {
    public static final String PUB_KEY = "pubkey";
    public static final String SUB_KEY = "subkey";
    public static final String CHANNEL = "channel";
    /**
     * Creates a PubNubPublisher.
     * @return A PubNubPublisher.
     */
    public static Publisher getPublisher(){
        String pubKey = Settings.getSetting(PUB_KEY);
        if(pubKey == null)
            throw new RuntimeException("Publish Key not found in settings");
        String subKey = Settings.getSetting(SUB_KEY);
        if(subKey==null)
            throw new RuntimeException("Subscribe Key not found in settings");
        String channel = Settings.getSetting(CHANNEL);
        if(channel == null)
            throw new RuntimeException("Channel Name not found in settings");
        return new PubNubPublisher(pubKey,subKey,channel);
    }
}
