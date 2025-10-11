import "../../components/css/button.css"
import { useNavigate } from 'react-router-dom'

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

type ResultButtonProps = {
  slotId?: string
  slotData?: any
}

export const ResultButton: React.FC<ResultButtonProps> = ({ slotId, slotData }) => {
  const navigate = useNavigate();
  return (
    <button
      className="sb-join-btn result-btn"
      onClick={() => {
        if (slotId || slotData?._id) {
          navigate('/winner', { state: { slotData, slotId: slotId || slotData?._id } });
        }
      }}
    >
      <span className="button-content">
        <img src="/assets/vector/S-Vector.png" alt="" className="button-icon" /> 
        View Results
      </span>
    </button>
  )
}
