const initialState = {
  status: false
};

const networking = (state = initialState, action: {type: string, payload?: object}) => {
  switch (action.type) {
    case "UPDATE_NETWORKING_STATUS": {
      console.log("UPDATING")
        return {...state, status: action.payload}
    }
    default:
      return state;
  }
}

export default networking;