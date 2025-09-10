import "../../components/css/button.css"

export const SpectedButton = () => {
  return (
    <button className="sb-join-btn">
      <span className="button-content">
        <img src="/assets/vector/S-Vector.png" alt="" className="button-icon" /> 
        Spectate
      </span>
    </button>
  )
}

export const ResultButton = () => {
  return (
    <button className="sb-join-btn result-btn">
      <span className="button-content">
        <img src="/assets/vector/S-Vector.png" alt="" className="button-icon" /> 
        Result
      </span>
    </button>
  )
}
