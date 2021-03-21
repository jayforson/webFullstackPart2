import axios from 'axios'
import React, { useState, useEffect } from 'react'

const CountryFilter = ({value, onChange}) => {
  return(
    <div>
      find countries <input value={value} onChange={onChange} />
    </div>
  )
}

const Country = ({country, onClick}) => {
  return(
    <div>{country.name} <button onClick={onClick}>show</button></div>
  )
}

const CountryWeather = ({country}) => {
  const api_key = process.env.REACT_APP_API_KEY
  const [weatherData, setWeatherData] = useState()
  useEffect(() => {
    axios
      .get('http://api.weatherstack.com/current?access_key=' + api_key + '&query=' + country.name)
      .then(response => {
        setWeatherData(response.data)
      })
  },[])

  if (weatherData){
    return(
      <div><h2>Weather in {country.capital}</h2>
        <div>Temperature: {weatherData.current.temperature} Celcius</div>
        <div>Local Time: {weatherData.location.localtime}</div>
        <div>
          {weatherData.current.weather_icons.map((weather_icon, index) => 
          <img key={index} src={weather_icon} alt='weather_icon'/>)}
        </div>
        <div>Wind: {weatherData.current.wind_speed} mph direction {weatherData.current.wind_dir}</div>
      </div>
    )
  }
  return null
}

const CountryInfo = ({country}) => {
  return(
    <div>
      <h1>{country.name}</h1>
      <div>capital: {country.capital}</div>
      <div>population: {country.population}</div>
      <div>currencies : {country.currencies.map(currency => currency.name)}</div>
      <h2>Spoken languages</h2>
      <ul>
        {country.languages.map((language, index) => 
          <li key={index}>
            {language.name}
          </li>)}
      </ul>
      <img src={country.flag} alt='flag' height = "200" width = "200"/>
      <CountryWeather country={country}/>
    </div>
  )
}

const CountriesToDisplay = ({countries, countryToDisplay, setCountryToDisplay, displayCountryInfo, setDisplayCountryInfo}) => {
  
  const onClick = (country) => () => {
    setCountryToDisplay(country)
    setDisplayCountryInfo(true)
  }


  if (displayCountryInfo) {
    return(
      <CountryInfo country={countryToDisplay} />
    )
  } else {  
    if (countries.length > 10) {
      return(
        <div>
          Too many matches, specify another filter
        </div>
      )
    }
    else {
      return(
        <div>
          <h2>Results</h2>
          {countries.map((country, index) => 
          <div key={index}>
            <Country country={country} onClick={onClick(country)}/>
          </div>)}
        </div>
    )}
  }
}



const App = () => {
  const [countries, setCountries] = useState([])
  const [countryFilter, setCountryFilter] = useState('')
  const [countryToDisplay, setCountryToDisplay] = useState()
  const [displayCountryInfo, setDisplayCountryInfo] = useState(false)

  useEffect(() => {
    axios
      .get('https://restcountries.eu/rest/v2/all')
      .then(response => {
        console.log(response.data)
        setCountries(response.data)
      })
  }, [])



  const countriesToShow = countryFilter === ''
                        ? []
                        : countries.filter(country => 
                          country.name.toUpperCase().includes(countryFilter.toUpperCase())
                          )


  const handleCoutryFilter = (event) => {
    setCountryFilter(event.target.value)
    setDisplayCountryInfo(false)
  }

  return(
    <div>
      <h1>Country Finder</h1>
      <CountryFilter value={countryFilter} onChange={handleCoutryFilter}/>
      <CountriesToDisplay countries={countriesToShow} 
                          countryToDisplay={countryToDisplay}
                          setCountryToDisplay={setCountryToDisplay}
                          displayCountryInfo={displayCountryInfo}
                          setDisplayCountryInfo={setDisplayCountryInfo}/>
    </div>
  )
}

export default App;
