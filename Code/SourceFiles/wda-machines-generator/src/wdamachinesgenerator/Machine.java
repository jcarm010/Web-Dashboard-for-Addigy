/*
    Machine class in order to generate multiple machines

    Basic Machine format:
        connectorid: 123123,
        uptime: 4,
        sp_user_name: "Jason Dettbarn (jason)",
        hostname: "jasons-air",
        sp_platform_uuid: "51103BF7-05AA-5988-99F8-EB6B2B867F00",
        sp_physical_memory: 8,
        sp_os_version: "OS X 10.9.4 (13E28)",
        sp_cpu_type: "Intel Core i7",
        sp_machine_name: "MacBook Air",
        sp_serial_number: "C2QLP009FMRW",
        macosx_productversion: "10.9.4",
        swapsize_mb: 2048.00, 
        swapfree_mb: 1445.00,
        timezone: "EDT",
        virtual: "physical",
        ipaddress: "192.168.1.145",
        fqdn: "addigy.com",
        apple_warranty: "November 25, 2014",
        location_lat: 25.7573634,
        location_long: -80.3761789,
        wan_ip: "73.46.14.233"
 */
package wdamachinesgenerator;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Francisco Marcano
 */
public class Machine {
   private int connectorid;
   private int uptime;
   private String sp_user_name;
   private String hostname;
   private String sp_platform_uuid;
   private int sp_physical_memory;
   private String sp_os_version;
   private String sp_cpu_type;
   private String sp_machine_name;
   private String sp_serial_number;
   private String macosx_productversion;
   private double swapsize_mb;
   private double swapfree_mb;
   private String timezone;
   private String virtual;
   private String ipaddress;
   private String fqdn;
   private String apple_warranty;
   private double location_lat;
   private double location_long;
   private String wan_ip;
   
   public Machine(int connector) {
       int scratch;
       
       this.connectorid = connector;
       this.uptime = getRandomNumber(0, 200);
       this.sp_user_name = getRandomUser();
       this.hostname = getRandomHostName(this.sp_user_name);
       this.sp_platform_uuid = "51103BF7-05AA-5988-99F8-EB6B2B867F00";
            while((scratch = getRandomNumber(2, 32)) % 2 != 0) {} 
       this.sp_physical_memory = scratch;
       this.sp_os_version = "OS X 10.9.4 (13E28)";
       this.sp_cpu_type = getRandomCPU();
       this.sp_machine_name = getRandomMachineName(this.hostname);
       this.sp_serial_number = "C2QLP009FMRW";
       this.macosx_productversion = "10.9.4";
       this.swapsize_mb = getRandomNumber(0, this.sp_physical_memory);
       this.swapfree_mb = getRandomNumber(0, (int)this.swapsize_mb);
       this.timezone = getTimeZone();
       this.virtual = "physical";
       this.ipaddress = "192.168.1.145";
       this.fqdn = "addigy.com";
       this.apple_warranty = "November 25, 2014";
       this.location_lat = 25.7573634;
       this.location_long = -80.3761789;
       this.wan_ip = "73.46.14.233";
   }
   
   public static List<Machine> generateMachines(int size){
       List<Machine> machines = new ArrayList<>();
       
       for(int i = 0; i < size; i++) {
           machines.add(new Machine(i + 100000));
       }
       
       return machines;
    }
   
   private String getRandomUser() {
       String[] firstname = {"Franco", "Jason", "Carlos", "Renan", "Javier", "Bob", "Michael",
                    "Andres", "Sergio", "Devid"};
       String[] lastname  = {"Zapata", "Marcano", "Dettbarn", "Dali", "Sassone", "Zepulveda",
                             "Cardona", "Colmenares", "Colbert", "Han" };
       
       int name = getRandomNumber(0, 10);
       return firstname[name] + " " + lastname[getRandomNumber(0, 10)] + " (" + firstname[name].toLowerCase() + ")";
   }
   
   private String getTimeZone() {
       String[] zone = {"EDT", "PDA", "EST", "PCT", "MPT", "KAS"};
       return zone[getRandomNumber(0, 6)];
   }
   
   private String getRandomHostName(String user) {
       String[] host = {"air", "pro", "station"};
       return user.substring(user.indexOf("(")+1, user.indexOf(")")) + "s-" + host[getRandomNumber(0, 3)];
   }
   
   private String getRandomCPU() {
       String[] cpu = {"i3", "i5", "i7"};
       return "Intel Core " + cpu[getRandomNumber(0, 3)];
   }
   
   private String getRandomMachineName(String type) {
       switch(type.substring(type.indexOf("-")+1)) {
           case "air": return "MacBook Air";
           case "pro": return "MacBook Pro";
           case "station": return "Mac Station";
           default: return "unifined";
       }
   }
   
   private int getRandomNumber(int min, int max) {
       return (int)(Math.random() * (max - min) + min);
   }
}
