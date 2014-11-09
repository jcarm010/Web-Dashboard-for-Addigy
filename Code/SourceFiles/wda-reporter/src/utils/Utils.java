package utils;

import java.io.File;
import java.io.IOException;
import java.net.DatagramSocket;
import java.net.ServerSocket;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.HttpVersion;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.mime.MultipartEntity;
import org.apache.http.entity.mime.content.ContentBody;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.CoreProtocolPNames;
import org.apache.http.util.EntityUtils;
import org.hyperic.sigar.NetFlags;
import org.hyperic.sigar.Sigar;
import org.hyperic.sigar.SigarException;
import org.json.JSONException;
import org.json.JSONObject;

/**
 *
 * @author javier
 */
public class Utils {
    public static final int MIN_PORT_NUMBER = 1;
    public static final int MAX_PORT_NUMBER = 65535;
    public static final String SERVER_ADDRESS = "http://wda-dev.cis.fiu.edu";
    public static final String DEVELOPMENT_ADDRESS = "http://localhost/wda";
    public static final String UPLOAD_PATH = "/scripts/upfile.php";
    public static final boolean DEVELOPMENT = false;
    public static final Sigar sigar = new Sigar();
    private static final int [] protocols = new int[] {
        NetFlags.CONN_CLIENT,
        NetFlags.CONN_PROTOCOLS,
        NetFlags.CONN_RAW,
        NetFlags.CONN_SERVER,
        NetFlags.CONN_TCP,
        NetFlags.CONN_UDP,
        NetFlags.CONN_UNIX
    };

    public static String uploadImage(String path, String machineId) {
        HttpClient httpclient = new DefaultHttpClient();
        httpclient.getParams().setParameter(CoreProtocolPNames.PROTOCOL_VERSION, HttpVersion.HTTP_1_1);
        HttpPost httppost = new HttpPost(getServerPath() + UPLOAD_PATH);
        httppost.setHeader("machineId", machineId);
        File file = new File(path);
        MultipartEntity mpEntity = new MultipartEntity();
        ContentBody contentFile = new FileBody(file);
        mpEntity.addPart("userfile", contentFile);
        httppost.setEntity(mpEntity);
        try {
            HttpResponse response = httpclient.execute(httppost);
            HttpEntity resEntity = response.getEntity();
            String p = null;
            if (resEntity != null) {
                String res = EntityUtils.toString(resEntity);
                System.out.println("Upload Response: "+res);
                resEntity.consumeContent();
                JSONObject obj = new JSONObject(res);
                p = obj.getString("path");
            }
            httpclient.getConnectionManager().shutdown();
            return p;
        } catch (IOException | JSONException err) {
            err.printStackTrace(System.err);
            return null;
        }
    }

    public static String getServerPath() {
        return DEVELOPMENT ? DEVELOPMENT_ADDRESS : SERVER_ADDRESS;
    }

    public static List<OpenPort> getOpenPorts() {
        List<OpenPort> lst = new ArrayList<>();
        for(int i = MIN_PORT_NUMBER ; i <= MAX_PORT_NUMBER;i++){
            OpenPort op = available(i);
            if(op.tcp || op.udp){
                lst.add(op);
            }
        }
        return lst;
    }

    /**
     * Checks to see if a specific port is available.
     * @param port the port to check for availability
     * @return 
     */
    public static OpenPort available(int port) {
        if (port < MIN_PORT_NUMBER || port > MAX_PORT_NUMBER) {
            throw new IllegalArgumentException("Invalid start port: " + port);
        }
        OpenPort p = new OpenPort(port);
        ServerSocket ss = null;
        DatagramSocket ds = null;
        try {
            ss = new ServerSocket(port);
            ss.setReuseAddress(true);
            ds = new DatagramSocket(port);
            ds.setReuseAddress(true);
        } catch (IOException e) {
        } finally {
            if (ds != null) ds.close();
            else p.udp = true;
            if (ss != null) 
                try {ss.close();} catch (IOException e) {/* should not be thrown */}
            else p.tcp = true;
        }
        return p;
    }

    public static class OpenPort {
        
        private final Sigar sigar;
        public int port;
        public boolean udp;
        public boolean tcp;
        public OpenPort(int port, boolean udp, boolean tcp){
            this.sigar = new Sigar();
            this.port = port;
            this.udp = udp;
            this.tcp = tcp;
        }
        public OpenPort(int port){
            this(port,false,false);
        }
        public String protocols(){
            String str = "";
            if(tcp) str += "TCP";
            if(tcp && udp) str +=", ";
            if(udp) str += "UDP";
            return str;
        }
        public String getApps(){
            Collection<String> names = getProcName(port);
            StringBuilder builder = new StringBuilder();
            names.stream().forEach((name) -> {
                if(builder.length()>0)
                    builder.append(", ");
                builder.append(name);
            });
            return builder.toString();
        }
        @Override
        public String toString(){
            return port+":"+(tcp?" TCP":"")+(udp?" UDP":"")+": "+getApps()+"\n";
        }
    }
    public static Collection<String> getProcName(int port){
        Set<Long> pids = new HashSet<>();
        for(int p : protocols)
            try{
                long pid = sigar.getProcPort(p, port);
                pids.add(pid);
            }catch(Exception err){}
        Set<String> names = new HashSet<>();
        pids.stream().forEach((l) -> {
            try{
                String name = sigar.getProcState(l).getName();
                if(name!=null) name = name.trim();
                if(name!=null && !name.isEmpty())names.add(name);
            }catch(Exception err){}
        });
        return names;
    }
    public static void main(String[] args) throws SigarException {
        
        List<OpenPort> ports = getOpenPorts();
        System.out.println(ports);
    }
}
