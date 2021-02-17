import { mapSelectors } from 'reselect-mapper'
import { Company } from './reducer'

// no params selectors
export const getName = (state: Company) => state.name
export const getCity = (state: Company) => state.city
export const getSelectedExpansion = (state: Company) => state.selectedExpansion

export const getEmployees = (state: Company) => state.employees.byId
export const getEmployeesIds = (state: Company) => state.employees.ids
export const getSelectedEmployeeId = (state: Company) => state.selectedEmployee

// combined no params selectors
export const getCityAndName = mapSelectors(
  { name: getName, city: getCity },
  (map, state) => ({ ...map, expansion: state.expansion })
)
export const getSelectedExpansionDate = mapSelectors(
  {
    name: getSelectedExpansion,
    expansions: (state: Company) => state.expansion
  },
  (map) => map.expansions[map.name].since
)
export const getSelectedEmployee = mapSelectors(
  { id: getSelectedEmployeeId, employees: getEmployees },
  (map) => (map.id ? map.employees[map.id] : null)
)
export const getEmployeesList = mapSelectors(
  { employees: getEmployees, ids: getEmployeesIds },
  (map) => map.ids.map((id) => map.employees[id])
)

// selectors with params
export const getEmployeeById = (state: Company, id: string) =>
  getEmployees(state)[id]

export const getExpansionByCountry = (
  state: Company,
  country: keyof Company['expansion']
) => state.expansion[country]

// combining selectors with params
export const getEmployeeAndCompany = mapSelectors(
  { company: getCityAndName, employee: getEmployeeById },
  (map) => map
)

export const getDidEmployeeSeeTheExpansion = mapSelectors(
  { employee: getEmployeeById, expansion: getExpansionByCountry },
  (map) => {
    return !map.employee ? false : map.employee.since <= map.expansion.since
  }
)
