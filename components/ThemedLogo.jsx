import { Image, useColorScheme } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Colors'

// images
import DarkLogo from '../assets/img/salad_dark.png'
import LightLogo from '../assets/img/salad_light.png'


const ThemedLogo = ({...props } ) => {
  const colorScheme = useColorScheme()
  const logo = colorScheme === 'dark' ? DarkLogo : LightLogo

  return (
    <Image source={logo} {...props} />
  )
}

export default ThemedLogo