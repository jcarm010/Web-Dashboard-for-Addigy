package comm;

/**
 *
 * @author javier
 */
public interface ChatMessageReceivedHandler {
    void onMessageReceived(String source, String message);
}
