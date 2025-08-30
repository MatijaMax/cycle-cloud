import React, { useState } from 'react';
import './App.css'; 

function App() {
  const [activeCity, setActiveCity] = useState('Novi Sad');

  const getCityContent = () => {
    switch (activeCity) {
      case 'Novi Sad':
        return (
          <>
            <h2>Novi Sad</h2>
            <div className="image-container">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Gradska_kuca_u_Novom_Sadu_4.jpg/1200px-Gradska_kuca_u_Novom_Sadu_4.jpg" alt="Novi Sad" />
            </div>
          </>
        );
      case 'Subotica':
        return (
          <>
            <h2>Subotica</h2>
            <div className="image-container">
              <img src="https://www.serbia.travel/wp-content/uploads/2024/11/1400x800-Palata-Rajhl-autor-Shutterstock.jpg" alt="Subotica" />
            </div>
          </>
        );
      case 'Kragujevac':
        return (
          <>
            <h2>Kragujevac</h2>
            <div className="image-container">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/View_on_the_city_of_Kragujevac.jpg/1200px-View_on_the_city_of_Kragujevac.jpg" alt="Kragujevac" />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>CYCLE CLOUD</h1>
        <nav className="city-nav">
          <button 
            className={`nav-button ${activeCity === 'Subotica' ? 'active' : ''}`}
            onClick={() => setActiveCity('Subotica')}
          >
            Subotica
          </button>
          <button
            className={`nav-button ${activeCity === 'Novi Sad' ? 'active' : ''}`}
            onClick={() => setActiveCity('Novi Sad')}
          >
            Novi Sad
          </button>
          <button
            className={`nav-button ${activeCity === 'Kragujevac' ? 'active' : ''}`}
            onClick={() => setActiveCity('Kragujevac')}
          >
            Kragujevac
          </button>
        </nav>
      </header>

      <main className="main-content">
        {getCityContent()}
        <section className="form-section">
          <h2>Registracija korisnika:</h2>
          <div className="form-group">
            <label className="label">Ime</label>
            <input type="text" className="input" />
          </div>
          <div className="form-group">
            <label className="label">Prezime</label>
            <input type="text" className="input" />
          </div>
          <div className="form-group">
            <label className="label">Adresa</label>
            <input type="text" className="input" />
          </div>
          <div className="form-group">
            <label className="label">JMBG</label>
            <input type="text" className="input" />
          </div>

        <button 
          type="button" 
          className="submit-button" 
          onClick={() => alert('Bajs registrovan!')}
        >
          Registruj
        </button>
        </section>

        <section className="form-section">
          <h2>Zaduživanje bicikala:</h2>
          <div className="form-group">
            <label className="label">Oznaka bicikla</label>
            <input type="text" className="input" />
          </div>
          <div className="form-group">
            <label className="label">Tip bicikla</label>
            <input type="text" className="input" />
          </div>          
          <div className="form-group">
            <label className="label">Datum zaduživanja</label>
            <input type="datetime-local" className="input" />
          </div>
          <div className="form-group">
            <label className="label">Jedinstveni broj</label>
            <input type="text" className="input" />
          </div> 
          <button 
          type="button" 
          className="submit-button" 
          onClick={() => alert('Bajs zadužen!')}
        >
          Zaduži
        </button>         
        </section>

                <section className="form-section">
          <h2>Razduživanje bicikala:</h2>
          <div className="form-group">
            <label className="label">Oznaka bicikla</label>
            <input type="text" className="input" />
          </div>
          <div className="form-group">
            <label className="label">Jedinstveni broj</label>
            <input type="text" className="input" />
          </div> 
          <button 
          type="button" 
          className="submit-button" 
          onClick={() => alert('Bajs razdužen!')}
        >
          Zaduži
        </button>         
        </section>
      </main>
    </div>
  );
}

export default App;