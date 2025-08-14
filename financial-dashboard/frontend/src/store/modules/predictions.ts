import { Module } from 'vuex'
import { MLPrediction } from '@/types'
import { apiService } from '@/services/api'

interface PredictionsState {
  predictions: MLPrediction[]
  isLoading: boolean
  lastUpdated: string | null
}

const predictions: Module<PredictionsState, any> = {
  namespaced: true,
  
  state: {
    predictions: [],
    isLoading: false,
    lastUpdated: null
  },
  
  getters: {
    predictionsByType: (state) => (type: string) => 
      state.predictions.filter(pred => pred.type === type),
    latestPredictions: (state) => [...state.predictions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    highConfidencePredictions: (state) => state.predictions.filter(pred => pred.confidence > 0.8)
  },
  
  mutations: {
    SET_LOADING(state, loading: boolean) {
      state.isLoading = loading
    },
    SET_PREDICTIONS(state, predictions: MLPrediction[]) {
      state.predictions = predictions
      state.lastUpdated = new Date().toISOString()
    },
    ADD_PREDICTION(state, prediction: MLPrediction) {
      state.predictions.push(prediction)
    },
    DELETE_PREDICTION(state, predictionId: string) {
      state.predictions = state.predictions.filter(pred => pred.id !== predictionId)
    }
  },
  
  actions: {
    async fetchPredictions({ commit }) {
      commit('SET_LOADING', true)
      try {
        const predictions = await apiService.get<MLPrediction[]>('/predictions')
        commit('SET_PREDICTIONS', predictions)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async generatePrediction({ commit }, { type, period }: { type: string; period: string }) {
      commit('SET_LOADING', true)
      try {
        const prediction = await apiService.post<MLPrediction>('/predictions/generate', {
          type,
          period
        })
        commit('ADD_PREDICTION', prediction)
        return prediction
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deletePrediction({ commit }, predictionId: string) {
      await apiService.delete(`/predictions/${predictionId}`)
      commit('DELETE_PREDICTION', predictionId)
    },
    
    async refreshPredictions({ dispatch }) {
      await apiService.post('/predictions/refresh')
      await dispatch('fetchPredictions')
    }
  }
}

export default predictions