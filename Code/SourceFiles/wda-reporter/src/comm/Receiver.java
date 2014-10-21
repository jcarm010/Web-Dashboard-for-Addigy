package comm;

/**
 *
 * @author javier
 */
public interface Receiver {
    /**
     * 
     * @param handler
     */
    public void whenAdminCheckedIn(AdminCheckedInHandler handler);
    public void onChatMessageReceived(ChatMessageReceivedHandler handler);
}
