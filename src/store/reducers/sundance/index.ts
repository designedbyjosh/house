import { RGBColor } from "react-color";

const initialState = {
  consent: false,
  color: {
    r: 0,
    g: 0,
    b: 0
  } as RGBColor
  };
  
  const sundance = (state = initialState, action: {type: string, payload?: object}) => {
    switch (action.type) {
      case "SUNDANCE_UPDATE_QUEUE": {
          return {...state, queue: action.payload}
      }
      case "SUNDANCE_UPDATE_CANVAS": {
        return {...state, canvas: action.payload}
    }
    case "UPDATE_SUNDANCE_RISK_CONSENT": {
      return {...state, consent: action.payload}
    }
    case "UPDATE_SUNDANCE_ACTIVE_COLOR": {
      return {...state, color: action.payload}
    }
      default:
        return state;
    }
  }
  
  export default sundance;