import { Image, useColorScheme } from 'react-native'
import React from 'react'
import { Colors } from '../constants/Colors'
import { useTheme } from '../contexts/ThemeContext';

// images
import DarkLogo from '../assets/img/title_logo_dark.png'
import LightLogo from '../assets/img/title_logo_light.png'


const ThemedTitleLogo = ({...props } ) => {
  const { themeName } = useTheme();
  const logo = themeName === 'dark' ? DarkLogo : LightLogo

  return (
    <Image source={logo} {...props} />
  )
}

export default ThemedTitleLogo