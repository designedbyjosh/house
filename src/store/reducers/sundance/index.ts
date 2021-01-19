const initialState = {
  };
  
  const sundance = (state = initialState, action: {type: string, payload?: object}) => {
    switch (action.type) {
      case "SUNDANCE_UPDATE_QUEUE": {
          return {...state, queue: action.payload}
      }
      case "SUNDANCE_UPDATE_CANVAS": {
        return {...state, canvas: action.payload}
    }
      default:
        return state;
    }
  }
  
  export default sundance;