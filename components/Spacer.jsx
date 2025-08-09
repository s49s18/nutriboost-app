// if I think a component needs a bit of space around it, I can use this Spacer component
import { View } from 'react-native'
import React from 'react'

const Spacer = ({ width = '100%', height = 40 }) => {
  return (
    <View style={[{ margin: 10, width, height }]} />
  )
}

export default Spacer