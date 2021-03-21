import phonebookService from './services/phonebookService'
import React, { useState, useEffect } from 'react'

const Notification = ({notification}) => {
  if (notification == null) {
    return null
  }
  
  return(
    <div className={notification.type}>
      {notification.message}
    </div>
  )
}
const Filter = ({value, onChange}) => {
  return(
    <div>
      filter shown with <input value={value} onChange={onChange}/>
    </div>
  )
}

const PersonForm = ({name, number, onNameChange, onNumberChange, onSubmit}) => {
  return(
    <form onSubmit={onSubmit}>
      <div>
        name: <input value={name} onChange={onNameChange}/>
      </div>
      <div>
        number: <input value={number} onChange={onNumberChange}/>
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({persons, onClick}) => {
  return(  
    <div>
      {persons.map( person => 
      <div key={person.id}>
        {person.name} {person.number} 
        <button onClick={onClick(person)}>delete</button>
      </div>)}
    </div>
  )
}

const App = () => {
  const [ persons, setPersons ] = useState([]) 
  const [ newName, setNewName ] = useState('')
  const [ newNumber, setNewNumber ] = useState('')
  const [ nameFilter, setNameFilter ] = useState('')
  const [ notification, setNotification] = useState(null)

  useEffect(() => {
    phonebookService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, []) 

  const personsToShow = nameFilter === '' 
    ? persons
    : persons.filter(person => 
    person.name.toUpperCase().includes(nameFilter.toUpperCase()))

  const displayNotification = (text, type) => {
    setNotification({message: text, type: type})
    setTimeout(() => {
      setNotification(null)
    }, 10000)
  }

  const addPerson = (event) => {
    event.preventDefault()

     // check if the user entered a number
    if (newNumber === '') {
      window.alert('Please input the number')
      return
    }

    // check if the name is already exsit
    const personToChange = persons.find(person => person.name.toUpperCase() === newName.toUpperCase())
    
    if (personToChange) {
      // if already in the server, prompt user to upadte number
      if (window.confirm(newName + ' is already added to phonebook, replace the old number with a new one?')) {
        const personToUpdate = {...personToChange, number: newNumber}
        phonebookService
          .update(personToChange.id, personToUpdate)
          .then(returnPerson => {
            setPersons(persons.map(p => p.id !== personToChange.id ? p : returnPerson ))
            displayNotification('Updated ' + returnPerson.name, 'notification')
          })
          .catch(error => {
            setPersons(persons.filter(p => p.id !== personToChange.id))
            displayNotification('information of ' + personToChange.name + ' has already been removed from server','error')
          })
      }
    } else{
      // if no the same name in the phoneBook, add name to service
      const newPerson = {name: newName, number: newNumber}
      phonebookService
        .create(newPerson)
        .then(createdPerson => {
          setPersons(persons.concat(createdPerson))
          displayNotification('Added ' + createdPerson.name, 'notification')
        })
        .catch(error => {
          displayNotification(error.response.data.error, 'error')
        })
      setNewName('')
      setNewNumber('')
    }
  }

  const onDeleteClicked = (person) => () => {
    if(window.confirm('Delete ' + person.name + '?')) {
      phonebookService
        .remove(person.id)
        .then(removedPerson => {
          setPersons(persons.filter(p => p.name !== person.name))
          displayNotification('removed ' + person.name, 'notification')
        })
        .catch(error => {
          setPersons(persons.filter(p => p.name !== person.name))
          displayNotification('information of ' + person.name + ' has already been removed from server','error')
        })
    } 
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleNameFilter = (event) => {
    setNameFilter(event.target.value)
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification notification={notification}/>
      <Filter value={nameFilter} onChange={handleNameFilter}/>
      <h3>add a new</h3>
      <PersonForm name={newName}
                  number={newNumber}
                  onNameChange={handleNameChange}
                  onNumberChange={handleNumberChange}
                  onSubmit={addPerson}/>
      <h2>Numbers</h2>
      <Persons persons={personsToShow} onClick={onDeleteClicked}/>
    </div>
  )
}

export default App