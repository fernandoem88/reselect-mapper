import React from 'react'
import { useCompanySelectors } from '../store/hooks'
// import {
//   getSelectedExpansion,
//   getSelectedEmployee,
//   getSelectedExpansionDate,
//   getDidEmployeeSeeTheExpansion
// } from '../store/selectors'

const SelectedEmployee = () => {
  const expansion = useCompanySelectors('getSelectedExpansion')
  const employee = useCompanySelectors('getSelectedEmployee')
  const expansionDate = useCompanySelectors('getSelectedExpansionDate')
  const sawCountryExpansion = useCompanySelectors(
    'getDidEmployeeSeeTheExpansion',
    { expansion, employee: employee?.id || '' }
  )

  if (!employee) return null
  return (
    <div>
      <h2>{employee.name}</h2>
      <div>started date: {employee.since}</div>
      <div>expansion date: {expansionDate}</div>
      <div>
        did the employee start before {expansion}? {String(sawCountryExpansion)}
      </div>
    </div>
  )
}

export default SelectedEmployee
