import React, { useState } from 'react';
import './App.css'; 

function App() {
  const [activeCity, setActiveCity] = useState('Novi Sad');

  const [registerForm, setRegisterForm] = useState({
    ime: '',
    prezime: '',
    adresa: '',
    jmbg: ''
  });

  const [rentForm, setRentForm] = useState({
    bike_label: '',
    bike_type: '',
    jmbg: ''
  });

  const [returnForm, setReturnForm] = useState({
    bike_label: '',
    jmbg: ''
  });

  const rentLabels = {
    bike_label: 'Oznaka bicikla',
    bike_type: 'Tip bicikla',
    jmbg: 'Jedinstveni broj'
  };

  const registerLabels = {
    ime: 'Ime',
    prezime: 'Prezime',
    adresa: 'Adresa',
    jmbg: 'JMBG'
  };

  const returnLabels = {
    bike_label: 'Oznaka bicikla',
    jmbg: 'Jedinstveni broj'
  };

  const CENTRAL_URL = "http://localhost:3000";

  const handleRegisterChange = e => setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  const handleRentChange = e => setRentForm({ ...rentForm, [e.target.name]: e.target.value });
  const handleReturnChange = e => setReturnForm({ ...returnForm, [e.target.name]: e.target.value });

  const registerUser = async () => {
    try {
      const res = await fetch(`${CENTRAL_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      const data = await res.json();
      alert(data.message || 'Korisnik registrovan!');
    } catch (err) {
      console.error(err);
      alert('Greška pri registraciji');
    }
  };

  const rentBike = async () => {
    try {
        const res = await fetch(`http://localhost:400${activeCity === 'Subotica' ? '1' : activeCity === 'Novi Sad' ? '2' : '3'}/rent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rentForm)
      });
      const data = await res.json();
      alert(data.message || 'Bicikl zadužen!');
    } catch (err) {
      console.error(err);
      alert('Greška pri zaduživanju bicikla');
    }
  };

  const returnBike = async () => {
    try {
        const res = await fetch(`http://localhost:400${activeCity === 'Subotica' ? '1' : activeCity === 'Novi Sad' ? '2' : '3'}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnForm)
      });
      const data = await res.json();
      alert(data.message || 'Bicikl razdužen!');
    } catch (err) {
      console.error(err);
      alert('Greška pri razduživanju bicikla');
    }
  };

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
          <button className={`nav-button ${activeCity === 'Subotica' ? 'active' : ''}`} onClick={() => setActiveCity('Subotica')}>Subotica</button>
          <button className={`nav-button ${activeCity === 'Novi Sad' ? 'active' : ''}`} onClick={() => setActiveCity('Novi Sad')}>Novi Sad</button>
          <button className={`nav-button ${activeCity === 'Kragujevac' ? 'active' : ''}`} onClick={() => setActiveCity('Kragujevac')}>Kragujevac</button>
        </nav>
      </header>

      <main className="main-content">
        {getCityContent()}

        <section className="form-section">
          <h2>Registracija korisnika:</h2>
          {['ime','prezime','adresa','jmbg'].map(field => (
            <div className="form-group" key={field}>
              <label className="label">{registerLabels[field]}</label>
              <input type="text" name={field} className="input" value={registerForm[field]} onChange={handleRegisterChange} />
            </div>
          ))}
          <button type="button" className="submit-button" onClick={registerUser}>Registruj</button>
        </section>

        <section className="form-section">
          <h2>Zaduživanje bicikala:</h2>
          {['bike_label','bike_type','jmbg'].map(field => (
            <div className="form-group" key={field}>
              <label className="label">{rentLabels[field]}</label>
              <input type="text" name={field} className="input" value={rentForm[field]} onChange={handleRentChange} />
            </div>
          ))}
          <button type="button" className="submit-button" onClick={rentBike}>Zaduži</button>
        </section>

        <section className="form-section">
          <h2>Razduživanje bicikala:</h2>
          {['bike_label','jmbg'].map(field => (
            <div className="form-group" key={field}>
              <label className="label">{returnLabels[field]}</label>
              <input type="text" name={field} className="input" value={returnForm[field]} onChange={handleReturnChange} />
            </div>
          ))}
          <button type="button" className="submit-button" onClick={returnBike}>Razduži</button>
        </section>
      </main>
    </div>
  );
}

export default App;
