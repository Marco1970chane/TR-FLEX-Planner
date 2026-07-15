import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import MedewerkerForm from "../components/MedewerkerForm";
import SearchBar from "../components/SearchBar";
import MedewerkerTable from "../components/MedewerkerTable";

export default function Medewerkers() {
  const [medewerkers, setMedewerkers] = useState([]);
  const [toonForm, setToonForm] = useState(false);
  const [zoekterm, setZoekterm] = useState("");

  async function laadMedewerkers() {
    const { data, error } = await supabase
      .from("medewerkers")
      .select("*")
      .order("naam");

    if (!error) {
      setMedewerkers(data);
    }
  }

  useEffect(() => {
    laadMedewerkers();
  }, []);

  return (
    <>
      <div className="table">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2>👷 Medewerkers</h2>

          <button
            className="new-btn"
            onClick={() => setToonForm(true)}
          >
            + Nieuwe medewerker
          </button>
        </div>

        <SearchBar
  value={zoekterm}
  onChange={setZoekterm}
/>
          
            
            
            
          
            
              
              
              
              
              
            
          
        

   <MedewerkerTable
  medewerkers={medewerkers.filter((m) =>
    m.naam.toLowerCase().includes(zoekterm.toLowerCase())
  )}
/>     
  
  

          
            
              
              
              
              
            
            
          

          
          
              
                
              
              
                
                  
                  
                  
                  

                  
                    

                    
                      
                      
                        
                        
                      
                    
                      
                    
                  
                
              
          
        
      </div>

      {toonForm && (
        <div className="modal">
          <div className="modal-content">
            <MedewerkerForm
              onSaved={() => {
                laadMedewerkers();
                setToonForm(false);
              }}
            />

            <button
              className="new-btn"
              onClick={() => setToonForm(false)}
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
    </>
  );
}