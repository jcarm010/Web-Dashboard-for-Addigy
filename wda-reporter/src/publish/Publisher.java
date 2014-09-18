package publish;

import org.json.JSONObject;

/**
 * A publisher for broadcasting information.
 * @author javier
 */
public interface Publisher {
    /**
     * Broadcast a message
     * @param msg The message to be broadcasted.
     */
    public void broadcastMessage(JSONObject msg);
}
