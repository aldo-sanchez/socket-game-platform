import React from 'react'
import { deviceMotion } from 'react-device-events'

class Motion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      acceleration: {
        x: 0,
        y: 0
      }
    }
  }

  render() {
    const { supported, acceleration, accelerationIncludingGravity, rotationRate, interval } = this.props.deviceMotion
    // const [accelerationX, accelerationY, accelerationZ] = acceleration || []
    const [gravityX, gravityY, gravityZ] = accelerationIncludingGravity || []
    // const [alpha, beta, gamma] = rotationRate || []
    this.props.childData(gravityX, gravityY);
    return (
      <ul>
        <li><strong>AccelerationX:</strong> {gravityX} </li>
        <li> AccelerationY: {gravityY}</li>
      </ul>
    )
  }
}

export default deviceMotion(Motion)