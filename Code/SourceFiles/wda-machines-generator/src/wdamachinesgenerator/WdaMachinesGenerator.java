/*
    Takes in input from the command line and returns
    a .json file composed of the machiens specified by
    the input arguments passed.

    @param numMachines  - The number of machines to generate
    @param fileName     - The name of the file to store the machines
                          If not specified, file name defaults to "dummyMachines.json"
*/
package wdamachinesgenerator;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.MalformedInputException;
import java.util.List;
import jsonparser.JsonWriter;

/**
 *
 * @author Francisco Marcano
 */
public class WdaMachinesGenerator {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) {
        
        ArgumentValidator validation;
        
        try {
            validation = new ArgumentValidator(args);
            List<Machine> machines = Machine.generateMachines(validation.getAmount());
            String json = JsonWriter.objectToJson(machines);
            
            BufferedWriter br = new BufferedWriter(new FileWriter(validation.getFileName()));
            
            br.write(json); 
            
            br.close();
        } catch(MalformedInputException mie) {
            System.exit(-1);
        } catch(IOException ioe) {
            System.out.println("Was not able to read Object into a JSON String");
        }
    }
    
    public static class ArgumentValidator {
        private int amount;
        private String fileName;
        
        public ArgumentValidator(String[] args) throws MalformedInputException {
            try {
                amount = validateAmount(args[0]);
                fileName = args[1];
            } catch(NumberFormatException nfe) {
                System.out.println("The amount passed is not a number or is incorrect!");
                printUsage();
                throw new MalformedInputException(amount);
            } catch(IndexOutOfBoundsException ioob) {
                System.out.println("There was no filename provided, please use the correct format when running the program");
                printUsage();
            }
        }
        
        private int validateAmount(String input) throws NumberFormatException{
            try {
                return Integer.parseInt(input);
            } catch(NumberFormatException e) {
                throw new NumberFormatException();
            }
        }
        
        private String printUsage() {
            return "In order to use the Random Machine Generator, the following " +
                    "arguments must be provided: \n" +
                    "\t $programName amount filename \n" +
                    "\t amount: \t The amoun of machines to generate\n" +
                    "\t fileName: \t The filename of the file to be created with all of the Machine Data\n";
        }
        
        public int getAmount() {
            return amount;
        }

        public String getFileName() {
            return fileName;
        }
        
        
    }
    
}
