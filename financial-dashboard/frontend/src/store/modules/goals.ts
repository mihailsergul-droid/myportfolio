import { Module } from 'vuex'
import { Goal } from '@/types'
import { apiService } from '@/services/api'

interface GoalsState {
  goals: Goal[]
  activeGoals: Goal[]
  isLoading: boolean
}

const goals: Module<GoalsState, any> = {
  namespaced: true,
  
  state: {
    goals: [],
    activeGoals: [],
    isLoading: false
  },
  
  getters: {
    completedGoals: (state) => state.goals.filter(goal => goal.currentAmount >= goal.targetAmount),
    goalsByPriority: (state) => (priority: string) => state.goals.filter(goal => goal.priority === priority),
    totalSaved: (state) => state.goals.reduce((sum, goal) => sum + goal.currentAmount, 0),
    totalTarget: (state) => state.goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  },
  
  mutations: {
    SET_LOADING(state, loading: boolean) {
      state.isLoading = loading
    },
    SET_GOALS(state, goals: Goal[]) {
      state.goals = goals
      state.activeGoals = goals.filter(goal => goal.currentAmount < goal.targetAmount)
    },
    ADD_GOAL(state, goal: Goal) {
      state.goals.push(goal)
      if (goal.currentAmount < goal.targetAmount) {
        state.activeGoals.push(goal)
      }
    },
    UPDATE_GOAL(state, updatedGoal: Goal) {
      const index = state.goals.findIndex(g => g.id === updatedGoal.id)
      if (index !== -1) {
        state.goals.splice(index, 1, updatedGoal)
      }
      
      const activeIndex = state.activeGoals.findIndex(g => g.id === updatedGoal.id)
      if (updatedGoal.currentAmount >= updatedGoal.targetAmount) {
        // Goal completed, remove from active goals
        if (activeIndex !== -1) {
          state.activeGoals.splice(activeIndex, 1)
        }
      } else {
        // Goal still active, update or add to active goals
        if (activeIndex !== -1) {
          state.activeGoals.splice(activeIndex, 1, updatedGoal)
        } else {
          state.activeGoals.push(updatedGoal)
        }
      }
    },
    DELETE_GOAL(state, goalId: string) {
      state.goals = state.goals.filter(g => g.id !== goalId)
      state.activeGoals = state.activeGoals.filter(g => g.id !== goalId)
    }
  },
  
  actions: {
    async fetchGoals({ commit }) {
      commit('SET_LOADING', true)
      try {
        const goals = await apiService.get<Goal[]>('/goals')
        commit('SET_GOALS', goals)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createGoal({ commit }, goalData: Partial<Goal>) {
      const goal = await apiService.post<Goal>('/goals', goalData)
      commit('ADD_GOAL', goal)
      return goal
    },
    
    async updateGoal({ commit }, { id, data }: { id: string; data: Partial<Goal> }) {
      const goal = await apiService.patch<Goal>(`/goals/${id}`, data)
      commit('UPDATE_GOAL', goal)
      return goal
    },
    
    async deleteGoal({ commit }, goalId: string) {
      await apiService.delete(`/goals/${goalId}`)
      commit('DELETE_GOAL', goalId)
    },
    
    async addContribution({ commit }, { goalId, amount }: { goalId: string; amount: number }) {
      const goal = await apiService.post<Goal>(`/goals/${goalId}/contribute`, { amount })
      commit('UPDATE_GOAL', goal)
      return goal
    }
  }
}

export default goals