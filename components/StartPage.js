import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Avatar } from "react-native-paper";

const { height, width } = Dimensions.get("window");

const StartPage = ({ navigation, route }) => {
  return (
    <View style={styles.container}>
      <View style={styles.startPageTop}>
        <View
          style={{
            width: "50%",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <Text style={styles.topicTxtfront}>Welcome to</Text>

          <Text style={styles.topicTxt}>BB-RELIEF</Text>
        </View>
        <View style={{ width: "50%" }}>
          <Image source={require("../assets/logo.png")} style={styles.image} />
        </View>
      </View>

      <View style={styles.bottomTxt}>
        <View style={styles.bodyTxtCon}>
          <ScrollView>
            <Text style={styles.bodyTxt}>
            Blister blight is a fungal disease that affects tea plants, causing blister-like lesions on the leaves. It spreads through spores and can lead to defoliation and reduced tea production. Prevention and control measures include sanitation practices and the use of fungicides. Timely management is important for healthy tea growth and high-quality production.
            </Text>
          </ScrollView>
        </View>
        <View style={styles.bodyNextCon}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Dash")}
            style={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#085E22",
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: "2%",
              elevation: 20,
              backgroundColor: "#085E22",
            }}
          >
            <Text
              style={{
                fontSize: 23,
                fontWeight: "bold",
                color: "white",
              }}
            >
              Let's Start
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default StartPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width / 23,
    paddingTop: height / 60,
    marginBottom: height / 7,
  },
  startPageCon: {
    width: "100%",
    height: "100%",
  },
  startPageTop: {
    width: "100%",
    height: "40%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  startPageBot: {
    backgroundColor: "green",
    width: "100%",
    height: "60%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  bottomTopic: {
    width: "100%",
    height: "15%",
    borderTopEndRadius: 30,
    borderTopLeftRadius: 30,
  },
  bottomTxt: {
    width: "100%",
    height: "75%",
  },
  topicTxt: {
    color: "black",
    fontSize: 30,
    fontWeight: "bold",
  },
  topicTxtfront: {
    color: "gray",
    fontSize: 20,
  },
  txtCon: {
    flexDirection: "row",
    justifyContent: "center",
  },
  bodyTxt: {
    color: "#085E22",
    fontSize: 19,
    textAlign: "justify",
  },
  bodyTxtCon: {
    width: "100%",
    height: "60%",
  },
  bodyNextCon: {
    width: "100%",
    height: "35%",
    marginBottom: height / 15,
    flex: 1,
    paddingHorizontal: width / 23,
    paddingTop: height / 60,
    justifyContent: "center",
  },
});
