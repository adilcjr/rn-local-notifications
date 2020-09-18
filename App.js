import { StatusBar } from 'expo-status-bar'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Button } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Permissions from 'expo-permissions'

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true
    }
  }
})

export default function App() {
  const [pushToken, setPushToken] = useState()

  useEffect(() => {
    Permissions.getAsync(Permissions.NOTIFICATIONS).then(
      (statusObject) => {
        if (statusObject.status !== 'granted') {
          return Permissions.askAsync(Permissions.NOTIFICATIONS)
        }
        return statusObject
      }
    ).then(
      (statusObject) => {
        console.log(statusObject)
        if (statusObject.status !== 'granted') {
          throw new Error('Permission not granted!')
        }
      }
    ).then(
      () => {
        return Notifications.getExpoPushTokenAsync()
      }
    ).then(
      (reponse) => {
        const pushToken = reponse.data
        setPushToken(pushToken)
      }
    ).catch((err) => {
      console.log(err)
      return null
    })
  }, [])

  useEffect(() => {
    const bgSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response)
    })
    const fgSubscription = Notifications.addNotificationReceivedListener( (notification) => {
      console.log(notification)
    })

    return () => {
      bgSubscription.remove()
      fgSubscription.remove()
    }
  })

  const triggerNotificationHandler = () => {
    // Local Notifications
    // Notifications.scheduleNotificationAsync({
    //   content: {
    //     title: 'My first local notification',
    //     body: 'This is the first local notification we are sending!',
    //     data: { mySpecialData: 'Some text'}
    //   },
    //   trigger: {
    //     seconds: 10,
    //   }
    // })
    // Remote Notifications
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: pushToken,
        data: {extraData: 'Some data'},
        title: 'Sent via the app',
        body: 'This push notification was sent via the app!',
      })
    })
  }

  return (
    <View style={styles.container}>
      <Button 
        title='Trigger Notification' 
        onPress={triggerNotificationHandler}
      />
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
