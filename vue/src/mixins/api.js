import { config, userProfile } from '../main'
import axios from 'axios'
import router from '../router'

export default {
  methods: {

    //
    // ===== Events =====
    //
    apiGetAllEvents: function() { 
      return this._apiRawCall(`events`)
    },

    apiGetEvent: function(id) { 
      return this._apiRawCall(`events/${id}`)
    },

    apiGetEventsFiltered: function(time) { 
      return this._apiRawCall(`events/filter/${time}`)
    },

    apiGetFeedbackForEvent: function(event) { 
      let calls = []
      let apifeedback = []

      for(let topic of event.topics) {
        calls.push(axios.get(`${config.API_ENDPOINT}/feedback/${event._id}/${topic.id}`))
      }

      // I only partially understand what this is doing
      // It should be waiting for all API calls to complete 
      axios.all(calls)
      .then(axios.spread((...allResponses) => {
        for(let resp of allResponses) {
          for(let data of resp.data) {
            apifeedback.push(data)
          }
        }
      }))

      return apifeedback
    },

    apiDeleteEvent: function(event) {
      return this._apiRawCall(`events/${event._id}`, 'delete')
    },

    apiUpdateEvent: function(event) {
      return this._apiRawCall(`events/${event._id}`, 'put', event)
    },

    apiCreateEvent: function(event) {
      return this._apiRawCall(`events`, 'post', event)
    },    

    //
    // ===== Feedback =====
    //

    apiPostFeedback: function(feedbackData) { 
      return this._apiRawCall(`feedback`, 'post', feedbackData)
    },

    //
    // ===== Private methods =====
    //

    _apiRawCall: function(apiPath, method = 'get', data = null) {
      var apiUrl = `${config.API_ENDPOINT}/${apiPath}`
      //console.log("### API CALL "+ apiUrl);

      var headers = {}

      // Send token as per the OAuth 2.0 bearer token scheme
      if(userProfile.idToken) {
        headers = {
          'Authorization': `Bearer ${userProfile.idToken}`
        }
      }

      return axios({
        method: method,
        url: apiUrl,
        data: data,
        headers: headers
      })
      .catch(err => {
        //console.log("### API CALL ERROR "+ err);
        let extra = ''
        if(err.response && err.response.data) extra = JSON.stringify(err.response.data)
        // Handle errors here, rather than up at caller level
        router.push({
          name: 'error', 
          replace: true, 
          params: { message: `API_ERROR:\n${apiUrl}\n${err.toString()} [${extra}]` }
        })
      })          
    },
  }
}