import React from 'react'
import { actions } from '../store/reducer'
import { useDispatch } from 'react-redux'
import { useCompanySelectors } from '../store/hooks'

const List = () => {
  const dispatch = useDispatch()
  const { city, name, expansion } = useCompanySelectors('getCityAndName')
  const list = useCompanySelectors('getEmployeesList')

  return (
    <div>
      <h1>company: {name}</h1>
      <div>city: {city}</div>
      <div>
        {Object.entries(expansion).map(([expName, obj]) => (
          <div
            style={{
              margin: 4,
              cursor: 'pointer',
              color: 'red',
              fontWeight: 'bold',
              borderRadius: 4
            }}
            key={expName}
            onClick={() => {
              dispatch(actions.selectExpansion(expName as any))
            }}
          >
            {expName} - {obj.since}
          </div>
        ))}
      </div>
      <ul>
        {list.map((employee) => {
          return (
            <li key={employee.id}>
              <div
                onClick={() => dispatch(actions.selectEmployee(employee.id))}
              >
                {employee.name}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default List
