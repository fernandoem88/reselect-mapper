import React, { useState } from 'react'
import uniqid from 'uniqid'
import { actions } from '../store/reducer'
import { useDispatch } from 'react-redux'

const EmployeeInput = () => {
  const [name, setName] = useState('')
  const [since, setSince] = useState(2021)
  const dispatch = useDispatch()
  const addEmployee = () => {
    const id = uniqid('empl__')
    dispatch(actions.addEmployee({ id, name, since }))
    setName('')
    setSince(2021)
  }
  return (
    <div>
      <h2>Add employee</h2>
      <div>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>Since</label>
        <input
          value={since}
          type='number'
          min={2021}
          max={2021}
          onChange={(e) => {
            setSince(e.target.value as any)
          }}
        />
      </div>
      {!!name && since >= 2010 && (
        <button onClick={addEmployee}>add user</button>
      )}
    </div>
  )
}

export default EmployeeInput
