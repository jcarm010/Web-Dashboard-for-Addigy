package comm;

import org.json.JSONObject;
import screen.ScreenCapture;

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
    /**
     * Broadcast a screen shot
     * @param capture The screenshot to send
     */
    public void broadcastScreenshot(ScreenCapture capture);
    
    public void broadcastMessage(String msg);
}
