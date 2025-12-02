import { View, Text, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function Welcome() {
  return (
    <View 
      style={{ 
        flex: 1, 
        alignItems: 'center', 
        paddingTop: 180, 
        backgroundColor: '#FFF8F0' 
      }}
    >
     
      <Image 
        source={require('./image/loginImg.png')
}
        style={{ width: 280, height: 280, marginBottom: 30 }}
        resizeMode="contain"
      />

 
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>
        Easy Buy & Sell
      </Text>

    
      <Text style={{ 
        fontSize: 14, 
        color: '#666', 
        marginBottom: 50, 
        textAlign: 'center',
        paddingHorizontal: 40
      }}>
        A safe and fast way to exchange secondhand goods on campus.
      </Text>

   
      <TouchableOpacity
        style={{
          backgroundColor: '#234594',
          paddingVertical: 14,
          borderRadius: 30,
          width: '80%',
          alignItems: 'center',
          marginBottom: 20
        }}
        onPress={() => router.push('/login')}
      >
        <Text style={{ color: '#fff', fontSize: 18 }}>Login</Text>
      </TouchableOpacity>

 
      <TouchableOpacity
        style={{
          paddingVertical: 14,
          borderRadius: 30,
          width: '80%',
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#234594'
        }}
        onPress={() => router.push('/signup')}
      >
        <Text style={{ color: '#234594', fontSize: 18 }}>Sign Up</Text>
      </TouchableOpacity>

    </View>
  );
}
