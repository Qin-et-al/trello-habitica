class HabiticaApi {
  constructor(
    trello, 
    storage = new HabiticaStorage(trello)
  ) {
    this.t = trello
    this.storage = storage
  }

  async request(url, userParams = {}) {
    let defaultParams = { 
      headers: await this.authHeaders()
    }

    let params = Object.assign({}, defaultParams, userParams)
    return fetch(url, params).then((res) => this.handleResponse(res))
  }

  async authHeaders() {
    let member = await this.t.get('member', 'private')
    return {
      'x-api-user': member.userId,
      'x-api-key': member.apiToken,
      'Content-Type': 'application/json'
    }
  }

  handleResponse(res) {
    if (res.ok) {
      return res.json()
    } else {
      return this.handleError(res)
    }
  }

  handleError(error) {
    let message = ''
    
    if (error.status == 404) {
      this.storage.removeTask()
    }

    console.error(`${error.status}: ${message}`)
    return error
  }
  
  addTask(params) {
    return this.request(API + '/tasks/user', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  removeTask(id) {
    return this.request(API + `/tasks/${id}`, {
      method: 'DELETE',
    })
  }

  doTask(id) {
    return this.request(API + `/tasks/${id}/score/up`, {
      method: 'POST',
    })
  }

  undoTask(id) {
    return this.request(API + `/tasks/${id}/score/down`, {
      method: 'POST',
    })
  }

  notify(message, display = 'info') {
    this.t.alert({
      message,
      display,
      duration: 3
    })
  }
}

// Fails in a browser, but required for tests.
try { module.exports = HabiticaApi } catch(_) {}