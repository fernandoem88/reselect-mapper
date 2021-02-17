import React from 'react'
import reducer from './store/reducer'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import List from './components/List'
import SelectedEmployee from './components/SelectedEmployee'
import EmployeeInput from './components/EmployeeInput'

const store = createStore(reducer)

const App = () => {
  return (
    <Provider store={store}>
      <div>
        <EmployeeInput />
        <SelectedEmployee />
        <List />
      </div>
    </Provider>
  )
}

export default App
