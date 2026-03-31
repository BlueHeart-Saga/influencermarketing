import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {

  return (

    <View style={styles.container}>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/(influencer)/settings/profile")}
      >
        <Ionicons name="person-outline" size={22} color="#333" />
        <Text style={styles.text}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/(influencer)/settings/bank-account")}
      >
        <Ionicons name="card-outline" size={22} color="#333" />
        <Text style={styles.text}>Bank Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/(influencer)/settings/settings")}
      >
        <Ionicons name="settings-outline" size={22} color="#333" />
        <Text style={styles.text}>Account settings</Text>
      </TouchableOpacity>

    </View>

  );
}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#fff",
padding:20
},

item:{
flexDirection:"row",
alignItems:"center",
gap:12,
paddingVertical:18,
borderBottomWidth:1,
borderColor:"#eee"
},

text:{
fontSize:16,
fontWeight:"500"
}

});