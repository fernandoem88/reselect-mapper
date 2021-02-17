import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Dictionary } from 'types'

const APP_ROOT_REDUCER = 'companyReducer'

export interface Employee {
  name: string
  since: number
  id: string
}
export interface Company {
  name: string
  city: string
  selectedEmployee: null | string
  employees: {
    ids: string[]
    byId: Dictionary<Employee>
  }
  expansion: {
    italy: { customers: number; since: number }
    france: { customers: number; since: number }
    germany: { customers: number; since: number }
  }
  selectedExpansion: 'italy' | 'france' | 'germany'
}

export const initialState: Company = {
  name: 'Testbirds GMBH',
  city: 'Munich',
  selectedEmployee: null,
  selectedExpansion: 'italy',
  employees: {
    ids: [],
    byId: {}
  },
  expansion: {
    germany: { customers: 124874, since: 2010 },
    italy: { customers: 57230, since: 2015 },
    france: { customers: 54890, since: 2020 }
  }
}

// redux slice for App reducers
const appSlice = createSlice({
  name: `${APP_ROOT_REDUCER}/root`,
  initialState,
  reducers: {
    /**
     * @description add a new employee
     * @param payload
     */
    addEmployee(state, { payload }: PayloadAction<Employee>) {
      const { employees } = state
      employees.ids.push(payload.id)
      employees.byId[payload.id] = payload
    },
    /**
     * @description delete an employee by id
     * @param payload
     */
    deleteEmployee(state, { payload: id }: PayloadAction<string>) {
      const {
        employees: { byId, ids }
      } = state
      if (byId[id]) {
        const employeeIndex = ids.findIndex((eId) => eId === id)
        delete byId[id]
        ids.splice(employeeIndex, 1)
      }
    },
    /**
     * @description select an employee
     * @param payload
     */
    selectEmployee(state, { payload: id }: PayloadAction<string>) {
      if (state.employees.byId[id]) {
        state.selectedEmployee = id
      }
    },
    /**
     * @description
     * @param payload
     */
    selectExpansion(
      state,
      { payload }: PayloadAction<keyof Company['expansion']>
    ) {
      state.selectedExpansion = payload
    }
  }
})

export const actions = appSlice.actions

export type AppActionName = keyof typeof actions
export type AppActionPayload<A extends AppActionName> = Parameters<
  typeof actions[A]
>[0]

export default appSlice.reducer
